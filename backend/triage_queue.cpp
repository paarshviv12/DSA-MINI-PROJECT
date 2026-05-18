// triage_queue.cpp
#ifndef TRIAGE_QUEUE_CPP
#define TRIAGE_QUEUE_CPP

#include "patient_records.cpp"

Patient* triageQueueHeap[1000];
int triageQueueSize = 0;

void swapPatients(Patient* &a, Patient* &b) {
    Patient* temp = a;
    a = b;
    b = temp;
}

bool hasHigherPriority(Patient* a, Patient* b) {
    if (a->severity != b->severity) {
        if (a->severity < b->severity) return true;
        else return false;
    }
    if (a->age != b->age) {
        if (a->age > b->age) return true;
        else return false;
    }
    if (a->arrivalTime < b->arrivalTime) {
        return true;
    } else {
        return false;
    }
}

void heapifyUp(int index) {
    while (index > 0) {
        int parentIndex = (index - 1) / 2;
        if (hasHigherPriority(triageQueueHeap[index], triageQueueHeap[parentIndex])) {
            swapPatients(triageQueueHeap[index], triageQueueHeap[parentIndex]);
            index = parentIndex;
        } else {
            break;
        }
    }
}

void heapifyDown(int index) {
    int bestIndex = index;
    int leftChild = 2 * index + 1;
    int rightChild = 2 * index + 2;
    
    if (leftChild < triageQueueSize) {
        if (hasHigherPriority(triageQueueHeap[leftChild], triageQueueHeap[bestIndex])) {
            bestIndex = leftChild;
        }
    }
    
    if (rightChild < triageQueueSize) {
        if (hasHigherPriority(triageQueueHeap[rightChild], triageQueueHeap[bestIndex])) {
            bestIndex = rightChild;
        }
    }
    
    if (bestIndex != index) {
        swapPatients(triageQueueHeap[index], triageQueueHeap[bestIndex]);
        heapifyDown(bestIndex);
    }
}

void enqueueToTriage(Patient* p) {
    triageQueueHeap[triageQueueSize] = p;
    triageQueueSize++;
    int lastIndex = triageQueueSize - 1;
    heapifyUp(lastIndex);
}

Patient* dequeueFromTriage() {
    if (triageQueueSize == 0) {
        return NULL;
    }
    
    Patient* topPatient = triageQueueHeap[0];
    
    int lastIndex = triageQueueSize - 1;
    triageQueueHeap[0] = triageQueueHeap[lastIndex];
    triageQueueSize--;
    
    if (triageQueueSize > 0) {
        heapifyDown(0);
    }
    
    return topPatient;
}

#endif
