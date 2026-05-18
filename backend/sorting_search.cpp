// sorting_search.cpp
#ifndef SORTING_SEARCH_CPP
#define SORTING_SEARCH_CPP

#include "patient_records.cpp"
#include "triage_queue.cpp"

void mergeHalves(Patient* arr[], int leftIndex, int midIndex, int rightIndex) {
    int leftSize = midIndex - leftIndex + 1;
    int rightSize = rightIndex - midIndex;
    
    Patient** leftArray = new Patient*[leftSize];
    Patient** rightArray = new Patient*[rightSize];
    
    for (int i = 0; i < leftSize; i++) {
        leftArray[i] = arr[leftIndex + i];
    }
    for (int j = 0; j < rightSize; j++) {
        rightArray[j] = arr[midIndex + 1 + j];
    }
    
    int i = 0;
    int j = 0;
    int k = leftIndex;
    
    while (i < leftSize && j < rightSize) {
        bool shouldPickLeft = false;
        
        if (leftArray[i]->severity != rightArray[j]->severity) {
            if (leftArray[i]->severity < rightArray[j]->severity) {
                shouldPickLeft = true;
            }
        } else if (leftArray[i]->age != rightArray[j]->age) {
            if (leftArray[i]->age > rightArray[j]->age) {
                shouldPickLeft = true;
            }
        } else {
            if (leftArray[i]->arrivalTime < rightArray[j]->arrivalTime) {
                shouldPickLeft = true;
            }
        }
        
        if (shouldPickLeft == true) {
            arr[k] = leftArray[i];
            i++;
        } else {
            arr[k] = rightArray[j];
            j++;
        }
        k++;
    }
    
    while (i < leftSize) {
        arr[k] = leftArray[i];
        i++; k++;
    }
    while (j < rightSize) {
        arr[k] = rightArray[j];
        j++; k++;
    }
    
    delete[] leftArray;
    delete[] rightArray;
}

void mergeSort(Patient* arr[], int leftIndex, int rightIndex) {
    if (leftIndex < rightIndex) {
        int midIndex = leftIndex + (rightIndex - leftIndex) / 2;
        
        mergeSort(arr, leftIndex, midIndex);
        mergeSort(arr, midIndex + 1, rightIndex);
        
        mergeHalves(arr, leftIndex, midIndex, rightIndex);
    }
}

void sortById(Patient* patients[], int size) {
    for (int i = 0; i < size; i++) {
        for (int j = i + 1; j < size; j++) {
            if (patients[i]->id > patients[j]->id) {
                swapPatients(patients[i], patients[j]);
            }
        }
    }
}

Patient* binarySearchById(Patient* patients[], int size, int targetId) {
    sortById(patients, size);
    
    int left = 0;
    int right = size - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (patients[mid]->id == targetId) {
            return patients[mid];
        } else if (patients[mid]->id < targetId) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return NULL;
}

void linearSearchByNameRange(Patient* patients[], int size, const char* startName, const char* endName, Patient* resultList[], int &resultCount) {
    resultCount = 0;
    
    char lowerStart[100]; stringCopy(lowerStart, startName); customToLower(lowerStart);
    char lowerEnd[100]; stringCopy(lowerEnd, endName); customToLower(lowerEnd);
    
    for (int i = 0; i < size; i++) {
        char currentName[100];
        stringCopy(currentName, patients[i]->name);
        customToLower(currentName);
        
        if (stringCompare(currentName, lowerStart) >= 0 && stringCompare(currentName, lowerEnd) <= 0) {
            resultList[resultCount] = patients[i];
            resultCount++;
        }
    }
}

#endif
