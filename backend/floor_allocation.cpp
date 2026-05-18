// floor_allocation.cpp
#ifndef FLOOR_ALLOCATION_CPP
#define FLOOR_ALLOCATION_CPP

#include "patient_records.cpp"
#include "utils.cpp"

struct Bed { 
    int bedNumber; 
    bool isOccupied; 
    int patientId; 
};

struct Floor {
    int floorNum; 
    int minSeverity; 
    int maxSeverity; 
    char name[50]; 
    Bed beds[20];
    int totalBeds;
};

Floor hospitalFloors[4];
int floorCount = 0;

int floorConnections[4][4];
int connectionsCount[4];

void setupFloors() {
    Floor icu;
    icu.floorNum = 0;
    stringCopy(icu.name, "ICU");
    icu.minSeverity = 1;
    icu.maxSeverity = 1;
    icu.totalBeds = 4;
    for(int i = 0; i < 4; i++) {
        Bed b; b.bedNumber = i + 1; b.isOccupied = false; b.patientId = -1;
        icu.beds[i] = b;
    }
    hospitalFloors[0] = icu;
    
    Floor er;
    er.floorNum = 1;
    stringCopy(er.name, "Emergency");
    er.minSeverity = 2;
    er.maxSeverity = 2;
    er.totalBeds = 6;
    for(int i = 0; i < 6; i++) {
        Bed b; b.bedNumber = i + 1; b.isOccupied = false; b.patientId = -1;
        er.beds[i] = b;
    }
    hospitalFloors[1] = er;
    
    Floor genA;
    genA.floorNum = 2;
    stringCopy(genA.name, "General A");
    genA.minSeverity = 3;
    genA.maxSeverity = 4;
    genA.totalBeds = 8;
    for(int i = 0; i < 8; i++) {
        Bed b; b.bedNumber = i + 1; b.isOccupied = false; b.patientId = -1;
        genA.beds[i] = b;
    }
    hospitalFloors[2] = genA;
    
    Floor genB;
    genB.floorNum = 3;
    stringCopy(genB.name, "General B");
    genB.minSeverity = 4;
    genB.maxSeverity = 5;
    genB.totalBeds = 10;
    for(int i = 0; i < 10; i++) {
        Bed b; b.bedNumber = i + 1; b.isOccupied = false; b.patientId = -1;
        genB.beds[i] = b;
    }
    hospitalFloors[3] = genB;
    
    floorCount = 4;
    
    floorConnections[0][0] = 1; connectionsCount[0] = 1;
    floorConnections[1][0] = 0; floorConnections[1][1] = 2; connectionsCount[1] = 2;
    floorConnections[2][0] = 1; floorConnections[2][1] = 3; connectionsCount[2] = 2;
    floorConnections[3][0] = 2; connectionsCount[3] = 1;
}

int countAvailableBedsOnFloor(int floorIndex) {
    int count = 0;
    for (int i = 0; i < hospitalFloors[floorIndex].totalBeds; i++) {
        if (hospitalFloors[floorIndex].beds[i].isOccupied == false) {
            count++;
        }
    }
    return count;
}

bool canFloorAcceptSeverity(int floorIndex, int severity) {
    bool correctSeverity = (severity >= hospitalFloors[floorIndex].minSeverity && 
                            severity <= hospitalFloors[floorIndex].maxSeverity);
    bool hasSpace = (countAvailableBedsOnFloor(floorIndex) > 0);
    
    if (correctSeverity && hasSpace) {
        return true;
    } else {
        return false;
    }
}

bool dfsAllocateBed(int currentFloor, int patientSev, int pId, bool visitedFloors[], int &resultFloor, int &resultBed) {
    if (currentFloor < 0 || currentFloor >= floorCount) return false;
    if (visitedFloors[currentFloor] == true) return false;
    
    visitedFloors[currentFloor] = true;
    
    if (canFloorAcceptSeverity(currentFloor, patientSev) == true) {
        for (int i = 0; i < hospitalFloors[currentFloor].totalBeds; i++) {
            if (hospitalFloors[currentFloor].beds[i].isOccupied == false) {
                hospitalFloors[currentFloor].beds[i].isOccupied = true;
                hospitalFloors[currentFloor].beds[i].patientId = pId;
                
                resultFloor = currentFloor;
                resultBed = hospitalFloors[currentFloor].beds[i].bedNumber;
                return true;
            }
        }
    }
    
    for (int i = 0; i < connectionsCount[currentFloor]; i++) {
        int nextFloor = floorConnections[currentFloor][i];
        if (dfsAllocateBed(nextFloor, patientSev, pId, visitedFloors, resultFloor, resultBed) == true) {
            return true;
        }
    }
    
    return false;
}

bool admitPatientToBed(Patient* p, int &allocatedFloor, int &allocatedBed) {
    if (p == NULL) return false;
    
    int startFloor = 3;
    if (p->severity == 1) startFloor = 0;
    else if (p->severity == 2) startFloor = 1;
    else if (p->severity <= 4) startFloor = 2;
    
    bool visited[4] = {false, false, false, false};
    
    bool success = dfsAllocateBed(startFloor, p->severity, p->id, visited, allocatedFloor, allocatedBed);
    
    if (success == true) {
        p->isAdmitted = true;
        p->assignedFloor = allocatedFloor;
        p->assignedBed = allocatedBed;
        return true;
    }
    
    return false;
}

#endif
