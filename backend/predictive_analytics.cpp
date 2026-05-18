// predictive_analytics.cpp
#ifndef PREDICTIVE_ANALYTICS_CPP
#define PREDICTIVE_ANALYTICS_CPP

#include "patient_records.cpp"
#include "utils.cpp"

double waitTimeAverage[6] = {0, 120, 90, 60, 40, 20}; 
int waitTimeCount[6] = {0, 10, 10, 10, 10, 10}; 
double waitTimeTotal[6] = {0, 1200, 900, 600, 400, 200};

void recordPatientTreatmentTime(int severity, double minutes) {
    if (severity >= 1 && severity <= 5) {
        waitTimeCount[severity]++;
        waitTimeTotal[severity] = waitTimeTotal[severity] + minutes;
        waitTimeAverage[severity] = waitTimeTotal[severity] / waitTimeCount[severity];
    }
}

double predictWaitTime(Patient* p, Patient* queueList[], int queueLength) {
    if (p == NULL) return 0;
    
    double waitSum = 0;
    
    for (int i = 0; i < queueLength; i++) {
        Patient* other = queueList[i];
        
        if (other->id == p->id || other->isDischarged || other->isAdmitted) {
            continue;
        }
        
        bool isAhead = false;
        if (other->severity < p->severity) {
            isAhead = true;
        } else if (other->severity == p->severity) {
            if (other->age > p->age) {
                isAhead = true;
            } else if (other->age == p->age) {
                if (other->arrivalTime < p->arrivalTime) {
                    isAhead = true;
                }
            }
        }
        
        if (isAhead == true) {
            waitSum = waitSum + waitTimeAverage[other->severity];
        }
    }
    
    double estimatedWait = waitSum / 2.0; 
    
    double rushMultiplier = 1.0;
    int hourOfDay = global_time_tick % 24;
    
    if (hourOfDay >= 8 && hourOfDay <= 11) {
        rushMultiplier = 1.3;
    } else if (hourOfDay >= 17 && hourOfDay <= 20) {
        rushMultiplier = 1.4;
    } else if (hourOfDay >= 0 && hourOfDay <= 5) {
        rushMultiplier = 0.7;
    }
    
    estimatedWait = estimatedWait * rushMultiplier;
    
    return maxDouble(5.0, estimatedWait);
}

int analyticsHourlyArrivals[24] = {0}; 
int analyticsSeverityCount[6] = {0}; 
int totalPatientsSeen = 0;
int totalPatientsDischarged = 0; 
double averageStayDuration = 0;

void recordAnalyticsArrival(Patient* p) {
    totalPatientsSeen++;
    int hour = p->arrivalTime % 24;
    analyticsHourlyArrivals[hour]++;
    analyticsSeverityCount[p->severity]++;
}

void recordAnalyticsDischarge(double minutesStay) {
    totalPatientsDischarged++;
    double previousTotal = averageStayDuration * (totalPatientsDischarged - 1);
    averageStayDuration = (previousTotal + minutesStay) / totalPatientsDischarged;
}

double predictBedsNeeded(int hoursInFuture, int currentQueueSize) {
    if (totalPatientsSeen == 0) return currentQueueSize;
    
    double arrivalRatePerHour = (double)totalPatientsSeen / 24.0;
    double expectedNewPatients = arrivalRatePerHour * hoursInFuture;
    
    double expectedDischarges = 0;
    if (averageStayDuration > 0) {
        expectedDischarges = (hoursInFuture * 60.0) / averageStayDuration;
    }
    
    double demand = currentQueueSize + expectedNewPatients - expectedDischarges;
    return maxDouble(0.0, demand);
}

void printEmergencyAlerts(Patient* allPatients[], int numPatients, int queueSize, int occupiedBeds, int totalBeds) {
    int criticalCount = 0;
    for (int i = 0; i < numPatients; i++) {
        if (allPatients[i]->isDischarged == false && allPatients[i]->severity == 1) {
            criticalCount++;
        }
    }
    
    if (criticalCount >= 3) {
        cout << "ALERT! " << criticalCount << " CRITICAL PATIENTS IN ER!\n";
    }
    
    if (queueSize >= 15) {
        cout << "WARNING: Long waiting queue! (" << queueSize << " waiting)\n";
    }
    
    if (totalBeds > 0) {
        double occupancyPercentage = ((double)occupiedBeds / totalBeds) * 100.0;
        if (occupancyPercentage > 85.0) {
            cout << "WARNING: High bed occupancy! (" << occupancyPercentage << "%)\n";
        }
    }
}

#endif
