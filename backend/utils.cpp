// utils.cpp
#ifndef UTILS_CPP
#define UTILS_CPP
#include <iostream>
using namespace std;

// Basic simulated global time 
int global_time_tick = 1;

// Basic swap for integers
void swapInt(int &a, int &b) {
    int temp = a;
    a = b;
    b = temp;
}

// Basic max for integers
int maxInt(int a, int b) {
    if (a > b) return a;
    return b;
}

// Basic max for double
double maxDouble(double a, double b) {
    if (a > b) return a;
    return b;
}

// Custom String Copy (dest = src)
void stringCopy(char* dest, const char* src) {
    int i = 0;
    while (src[i] != '\0') {
        dest[i] = src[i];
        i++;
    }
    dest[i] = '\0';
}

// Custom String Compare
int stringCompare(const char* s1, const char* s2) {
    int i = 0;
    while (s1[i] != '\0' && s2[i] != '\0') {
        if (s1[i] != s2[i]) {
            return s1[i] - s2[i];
        }
        i++;
    }
    return s1[i] - s2[i];
}

// String to lower case converter (in-place)
void customToLower(char* str) {
    int i = 0;
    while (str[i] != '\0') {
        if (str[i] >= 'A' && str[i] <= 'Z') {
            str[i] = str[i] + 32;
        }
        i++;
    }
}

#endif
