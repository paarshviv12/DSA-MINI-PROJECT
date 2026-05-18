// patient_records.cpp
#ifndef PATIENT_RECORDS_CPP
#define PATIENT_RECORDS_CPP

#include "utils.cpp"

struct PatientHistory {
    int timeTick;
    int severity;
};

struct Patient {
    int id; 
    char name[100]; 
    int age; 
    int severity;
    int arrivalTime; 
    char condition[100];
    bool isAdmitted; 
    int assignedFloor; 
    int assignedBed; 
    bool isDischarged;
    PatientHistory severityHistory[50];
    int historyCount;
};

// Global patient database array
Patient* patientDatabase[1000];
int dbSize = 0;
int nextPatientId = 1001;

// Function to create a new patient
Patient* createPatient(int id, const char* name, int age, int severity, const char* condition) {
    Patient* newPatient = new Patient;
    newPatient->id = id;
    stringCopy(newPatient->name, name);
    newPatient->age = age;
    newPatient->severity = severity;
    stringCopy(newPatient->condition, condition);
    newPatient->arrivalTime = global_time_tick;
    global_time_tick++;
    newPatient->isAdmitted = false;
    newPatient->assignedFloor = -1;
    newPatient->assignedBed = -1;
    newPatient->isDischarged = false;
    
    newPatient->historyCount = 0;
    newPatient->severityHistory[newPatient->historyCount].timeTick = newPatient->arrivalTime;
    newPatient->severityHistory[newPatient->historyCount].severity = severity;
    newPatient->historyCount++;
    
    return newPatient;
}

// Function to update patient severity
void updatePatientSeverity(Patient* p, int newSeverity) {
    p->severity = newSeverity;
    p->severityHistory[p->historyCount].timeTick = global_time_tick;
    global_time_tick++;
    p->severityHistory[p->historyCount].severity = newSeverity;
    p->historyCount++;
}

// Function to check trend
void getSeverityTrend(Patient* p, char* trendResult) {
    if (p->historyCount < 2) {
        stringCopy(trendResult, "STABLE");
        return;
    }
    
    int recentSeverity = p->severityHistory[p->historyCount - 1].severity;
    int oldSeverity = p->severityHistory[p->historyCount - 2].severity;
    
    if (recentSeverity < oldSeverity) {
        stringCopy(trendResult, "WORSENING");
    } else if (recentSeverity > oldSeverity) {
        stringCopy(trendResult, "IMPROVING");
    } else {
        stringCopy(trendResult, "STABLE");
    }
}

void registerPatientToDB(const char* name, int age, int severity, const char* condition) {
    Patient* p = createPatient(nextPatientId, name, age, severity, condition);
    nextPatientId++;
    patientDatabase[dbSize] = p;
    dbSize++;
}

Patient* findPatientById(int id) {
    for (int i = 0; i < dbSize; i++) {
        if (patientDatabase[i]->id == id) {
            return patientDatabase[i];
        }
    }
    return NULL;
}

void getActivePatients(Patient* activeList[], int &activeCount) {
    activeCount = 0;
    for (int i = 0; i < dbSize; i++) {
        if (patientDatabase[i]->isDischarged == false) {
            activeList[activeCount] = patientDatabase[i];
            activeCount++;
        }
    }
}

// Undo Stack Logic
int REGISTER = 1;
int UPDATE_SEVERITY = 2;
int ADMIT = 3;
int DISCHARGE = 4;
int TRANSFER = 5;

struct Operation {
    int type; 
    int patientId; 
    char description[100]; 
    int timestamp;
};

Operation undoStackArray[5];
int undoStackTop = -1;

void pushToUndoStack(int type, int pId, const char* desc) {
    if (undoStackTop == 4) {
        for (int i = 0; i < 4; i++) {
            undoStackArray[i] = undoStackArray[i+1];
        }
        undoStackTop--;
    }
    
    undoStackTop++;
    undoStackArray[undoStackTop].type = type;
    undoStackArray[undoStackTop].patientId = pId;
    stringCopy(undoStackArray[undoStackTop].description, desc);
    undoStackArray[undoStackTop].timestamp = global_time_tick;
}

Operation popFromUndoStack() {
    Operation op = undoStackArray[undoStackTop];
    undoStackTop--;
    return op;
}

#endif
