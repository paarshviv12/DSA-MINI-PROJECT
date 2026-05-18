// main.cpp
#include <iostream>

#include "utils.cpp"
#include "patient_records.cpp"
#include "triage_queue.cpp"
#include "sorting_search.cpp"
#include "avl_tree.cpp"
#include "floor_allocation.cpp"
#include "predictive_analytics.cpp"

using namespace std;

void printMenu() {
    cout << "\n=============================================\n";
    cout << " ER Triage System (Pure <iostream> Only) \n";
    cout << "=============================================\n";
    cout << "1. Register Patient\n";
    cout << "2. View Waiting Queue\n";
    cout << "3. Admit Next Priority Patient\n";
    cout << "4. Check System Alerts & Predictions\n";
    cout << "5. Search Patient by ID\n";
    cout << "6. View All Hospital Floors\n";
    cout << "7. Exit Program\n";
    cout << "Choice: ";
}

int main() {
    cout << "Starting pure C++ system using ONLY <iostream>...\n";
    
    // Initialize floors
    setupFloors();
    
    // Add some sample data manually
    registerPatientToDB("John", 45, 1, "Heart Attack");
    Patient* p1 = patientDatabase[0];
    enqueueToTriage(p1);
    avlRoot = insertIntoAVL(avlRoot, p1);
    recordAnalyticsArrival(p1);
    
    registerPatientToDB("Jane", 22, 3, "Broken Arm");
    Patient* p2 = patientDatabase[1];
    enqueueToTriage(p2);
    avlRoot = insertIntoAVL(avlRoot, p2);
    recordAnalyticsArrival(p2);
    
    while(true) {
        printMenu();
        int choice;
        cin >> choice;
        
        if (choice == 7) {
            cout << "Exiting...\n";
            break;
        }
        
        if (choice == 1) {
            char name[100], condition[100]; 
            int age, severity;
            
            cout << "Enter Patient Name: "; 
            cin >> name;
            cout << "Enter Age: "; 
            cin >> age;
            cout << "Enter Severity (1 is worst, 5 is best): "; 
            cin >> severity;
            cout << "Enter Condition: "; 
            cin >> condition;
            
            registerPatientToDB(name, age, severity, condition);
            int lastIndex = dbSize - 1;
            Patient* newPatient = patientDatabase[lastIndex];
            
            enqueueToTriage(newPatient);
            avlRoot = insertIntoAVL(avlRoot, newPatient);
            recordAnalyticsArrival(newPatient);
            
            pushToUndoStack(REGISTER, newPatient->id, "Registered patient");
            cout << "Successfully registered patient with ID: " << newPatient->id << "\n";
        }
        else if (choice == 2) {
            cout << "\n--- Current Triage Queue (" << triageQueueSize << " patients) ---\n";
            for(int i = 0; i < triageQueueSize; i++) {
                cout << i + 1 << ". " << triageQueueHeap[i]->name 
                     << " [Severity: " << triageQueueHeap[i]->severity 
                     << ", Age: " << triageQueueHeap[i]->age << "]\n";
            }
        }
        else if (choice == 3) {
            if (triageQueueSize == 0) {
                cout << "\nThe queue is empty. No one to admit.\n";
            } else {
                Patient* topPatient = dequeueFromTriage();
                int floorNum, bedNum;
                
                bool admitted = admitPatientToBed(topPatient, floorNum, bedNum);
                
                if (admitted == true) {
                    cout << "\nAdmitted patient " << topPatient->name 
                         << " to Floor " << floorNum << ", Bed " << bedNum << "\n";
                    pushToUndoStack(ADMIT, topPatient->id, "Admitted patient");
                } else {
                    cout << "\nError: No available beds for this severity!\n";
                    enqueueToTriage(topPatient); 
                }
            }
        }
        else if (choice == 4) {
            cout << "\n--- System Predictions & Alerts ---\n";
            
            Patient* activeList[1000];
            int activeCount = 0;
            getActivePatients(activeList, activeCount);
            
            int activeAdmittedCount = 0;
            for(int i = 0; i < activeCount; i++) {
                if (activeList[i]->isAdmitted == true) {
                    activeAdmittedCount++;
                }
            }
            
            int totalHospitalBeds = 28; // 4 + 6 + 8 + 10
            
            printEmergencyAlerts(activeList, activeCount, triageQueueSize, activeAdmittedCount, totalHospitalBeds);
            
            double expectedDemand = predictBedsNeeded(2, triageQueueSize);
            cout << "Estimated bed demand in next 2 hours: " << expectedDemand << " beds\n";
        }
        else if (choice == 5) {
            cout << "\nEnter Patient ID to search: ";
            int searchId; 
            cin >> searchId;
            
            Patient* found = binarySearchById(patientDatabase, dbSize, searchId);
            
            if (found != NULL) {
                cout << "\nFound Patient:\n";
                cout << "Name: " << found->name << "\n";
                cout << "Age: " << found->age << "\n";
                cout << "Severity: " << found->severity << "\n";
                cout << "Condition: " << found->condition << "\n";
            } else {
                cout << "\nPatient with ID " << searchId << " not found.\n";
            }
        }
        else if (choice == 6) {
            cout << "\n--- Hospital Floor Status ---\n";
            for(int i = 0; i < floorCount; i++) {
                int freeBeds = countAvailableBedsOnFloor(i);
                int totalBeds = hospitalFloors[i].totalBeds;
                cout << "Floor " << hospitalFloors[i].floorNum << " (" << hospitalFloors[i].name << "): " 
                     << freeBeds << " / " << totalBeds << " beds available.\n";
            }
        }
    }
    
    return 0;
}
