// avl_tree.cpp
#ifndef AVL_TREE_CPP
#define AVL_TREE_CPP

#include "patient_records.cpp"
#include "utils.cpp"

struct AVLNode {
    Patient* patient; 
    AVLNode* left; 
    AVLNode* right; 
    int height;
};

AVLNode* createAVLNode(Patient* p) {
    AVLNode* newNode = new AVLNode;
    newNode->patient = p;
    newNode->left = NULL;
    newNode->right = NULL;
    newNode->height = 1;
    return newNode;
}

AVLNode* avlRoot = NULL;
int avlNodeCount = 0;

int getNodeHeight(AVLNode* node) {
    if (node == NULL) {
        return 0;
    }
    return node->height;
}

int getBalanceFactor(AVLNode* node) {
    if (node == NULL) {
        return 0;
    }
    int leftHeight = getNodeHeight(node->left);
    int rightHeight = getNodeHeight(node->right);
    return leftHeight - rightHeight;
}

void updateNodeHeight(AVLNode* node) {
    if (node != NULL) {
        int leftHeight = getNodeHeight(node->left);
        int rightHeight = getNodeHeight(node->right);
        node->height = 1 + maxInt(leftHeight, rightHeight);
    }
}

int compareTwoPatients(Patient* a, Patient* b) {
    // Return negative if a < b, positive if a > b, 0 if equal
    if (a->severity != b->severity) {
        return a->severity - b->severity;
    } else if (a->age != b->age) {
        return b->age - a->age; // older is smaller/better priority
    } else if (a->arrivalTime != b->arrivalTime) {
        if (a->arrivalTime < b->arrivalTime) return -1;
        else return 1;
    } else {
        return a->id - b->id;
    }
}

AVLNode* rightRotate(AVLNode* y) {
    AVLNode* x = y->left; 
    AVLNode* T2 = x->right;
    
    x->right = y; 
    y->left = T2;
    
    updateNodeHeight(y); 
    updateNodeHeight(x); 
    
    return x;
}

AVLNode* leftRotate(AVLNode* x) {
    AVLNode* y = x->right; 
    AVLNode* T2 = y->left;
    
    y->left = x; 
    x->right = T2;
    
    updateNodeHeight(x); 
    updateNodeHeight(y); 
    
    return y;
}

AVLNode* insertIntoAVL(AVLNode* node, Patient* p) {
    if (node == NULL) {
        avlNodeCount++; 
        return createAVLNode(p);
    }
    
    int cmp = compareTwoPatients(p, node->patient);
    
    if (cmp < 0) {
        node->left = insertIntoAVL(node->left, p);
    } else if (cmp > 0) {
        node->right = insertIntoAVL(node->right, p);
    } else {
        return node;
    }
    
    updateNodeHeight(node); 
    int balance = getBalanceFactor(node);
    
    // Left Left Case
    if (balance > 1 && compareTwoPatients(p, node->left->patient) < 0) {
        return rightRotate(node);
    }
    
    // Right Right Case
    if (balance < -1 && compareTwoPatients(p, node->right->patient) > 0) {
        return leftRotate(node);
    }
    
    // Left Right Case
    if (balance > 1 && compareTwoPatients(p, node->left->patient) > 0) { 
        node->left = leftRotate(node->left); 
        return rightRotate(node); 
    }
    
    // Right Left Case
    if (balance < -1 && compareTwoPatients(p, node->right->patient) < 0) { 
        node->right = rightRotate(node->right); 
        return leftRotate(node); 
    }
    
    return node;
}

#endif
