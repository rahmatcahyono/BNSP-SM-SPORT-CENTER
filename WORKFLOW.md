# System Workflows & Business Processes

## 1. Flowchart: General Reservation Process
This flowchart illustrates the high-level steps for making a reservation, from schedule checking to admin approval.

```mermaid
flowchart TD
    A([Start]) --> B{Is Logged In?}
    B -- No --> C[Login / Register]
    C --> D
    B -- Yes --> D[View Schedule]
    D --> E[Select Court, Date, Time]
    E --> F{Slot Available?}
    F -- No --> D
    F -- Yes --> G[Submit Reservation]
    G --> H[Create Pending Invoice]
    H --> I[Upload Payment Proof]
    I --> J{Admin Review Payment}
    J -- Reject --> K[Booking Canceled, Slot Released]
    J -- Approve --> L[Booking Confirmed]
    L --> M([End])
    K --> M
```

## 2. BPMN (Business Process Model and Notation) - Booking & Payment
Implemented using a Swimlane Diagram to represent the cross-functional processes.

```mermaid
sequenceDiagram
    actor Customer
    participant System as Reservation System
    participant DB as PostgreSQL DB
    actor Admin

    Customer->>System: 1. Request to Book (Court X, 10:00 AM)
    System->>DB: 2. BEGIN TRANSACTION
    System->>DB: 3. SELECT ... FOR UPDATE (Lock row)
    DB-->>System: 4. Lock Acquired (Row Empty)
    System->>DB: 5. INSERT Reservation (Status: PENDING)
    System->>DB: 6. COMMIT
    System-->>Customer: 7. Show Invoice
    Customer->>System: 8. Upload Transfer Receipt
    System->>DB: 9. UPDATE Reservation (Status: UPLOADED)
    System-->>Admin: 10. Notify New Payment Proof
    Admin->>System: 11. Review Receipt & Approve
    System->>DB: 12. UPDATE Reservation (Status: CONFIRMED)
    System-->>Customer: 13. Send Confirmation Notification
```

## 3. Activity Diagram: Double Booking Prevention Flow
This details the critical business logic that prevents two customers from booking the exact same court at the exact same time.

```mermaid
stateDiagram-v2
    [*] --> Request_Booking
    Request_Booking --> Check_Session
    Check_Session --> Validation_Passed: Role = Customer
    Validation_Passed --> Start_DB_Transaction
    Start_DB_Transaction --> Lock_Time_Slot
    
    state Lock_Time_Slot {
        direction LR
        Query_Slot --> Row_Exists?
    }
    
    Lock_Time_Slot --> Slot_Taken : Yes
    Slot_Taken --> Rollback_Transaction
    Rollback_Transaction --> Return_Error_To_User
    Return_Error_To_User --> [*]
    
    Lock_Time_Slot --> Slot_Available : No
    Slot_Available --> Insert_New_Booking
    Insert_New_Booking --> Commit_Transaction
    Commit_Transaction --> Success_Response
    Success_Response --> [*]
```
