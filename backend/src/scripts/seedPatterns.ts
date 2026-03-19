// backend/src/scripts/seedPatterns.ts
import dotenv from 'dotenv';
import { ragService } from '../services/rag.service';

dotenv.config();

const patterns = [
  {
    pattern: "Arrays & Hashing",
    description: "Using arrays and hash tables to solve problems efficiently",
    intuition: "Think of a hash table as a super-fast phonebook. Instead of searching through pages, you can instantly look up any entry. This makes it perfect for problems where you need to quickly check if something exists or count occurrences.",
    pseudocode: `
1. Create a hash map/object
2. Iterate through the array
3. For each element:
   - Check if it exists in hash map
   - Store or update information
   - Use stored data for comparisons
4. Return result based on hash map data
    `,
    whenToUse: [
      "Need O(1) lookup time",
      "Counting frequency of elements",
      "Finding duplicates or unique elements",
      "Two sum type problems",
      "Group or categorize data"
    ],
    commonMistakes: [
      "Not handling edge cases (empty array, single element)",
      "Forgetting to check if key exists before accessing",
      "Using array when hash map would be more efficient",
      "Not considering space complexity trade-offs"
    ],
    exampleProblems: [
      "Two Sum",
      "Valid Anagram",
      "Contains Duplicate",
      "Group Anagrams"
    ],
    timeComplexity: "O(n) for most operations",
    spaceComplexity: "O(n) for storing hash map"
  },
  {
    pattern: "Two Pointers",
    description: "Using two pointers moving towards each other or in the same direction",
    intuition: "Imagine you're searching for something in a sorted list. Instead of checking every single item, you can use two fingers - one starting at the beginning and one at the end. By moving them strategically based on what you find, you can eliminate large portions of the search space at once.",
    pseudocode: `
1. Initialize two pointers (usually left and right)
2. While pointers haven't crossed:
   - Check condition at current positions
   - Move pointers based on condition
   - Update result if needed
3. Return final result
    `,
    whenToUse: [
      "Array or string is sorted",
      "Finding pairs that meet a condition",
      "Removing duplicates in-place",
      "Palindrome checking",
      "Container/water problems"
    ],
    commonMistakes: [
      "Not handling sorted vs unsorted arrays correctly",
      "Infinite loops from incorrect pointer movement",
      "Off-by-one errors in loop conditions",
      "Not considering edge cases (empty, single element)"
    ],
    exampleProblems: [
      "Two Sum II",
      "3Sum",
      "Container With Most Water",
      "Valid Palindrome",
      "Remove Duplicates from Sorted Array"
    ],
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)"
  },
  {
    pattern: "Sliding Window",
    description: "Maintaining a window of elements and sliding it through the array",
    intuition: "Picture a window frame sliding along a wall. Instead of recalculating everything for each position, you just add what's coming in and remove what's going out. This saves enormous amounts of work when dealing with subarrays or substrings.",
    pseudocode: `
1. Initialize window (start, end pointers)
2. Expand window by moving end pointer
3. When condition is violated:
   - Shrink window from start
   - Update window state
4. Track maximum/minimum during process
5. Return result
    `,
    whenToUse: [
      "Contiguous subarray/substring problems",
      "Finding max/min in subarrays of size k",
      "Longest/shortest substring with condition",
      "Problems with 'contiguous' or 'consecutive' keywords"
    ],
    commonMistakes: [
      "Not updating window state correctly when shrinking",
      "Forgetting to handle window expansion vs shrinking",
      "Not tracking the best result during window movement",
      "Incorrect window size calculations"
    ],
    exampleProblems: [
      "Maximum Sum Subarray of Size K",
      "Longest Substring Without Repeating Characters",
      "Minimum Window Substring",
      "Longest Repeating Character Replacement"
    ],
    timeComplexity: "O(n)",
    spaceComplexity: "O(1) to O(k)"
  },
  {
    pattern: "Binary Search",
    description: "Efficiently searching in sorted arrays by repeatedly dividing search space",
    intuition: "Like finding a name in a phone book, you don't start from page 1. You open it in the middle, check if you need to go left or right, and repeat. Each step eliminates half of the remaining options.",
    pseudocode: `
1. Initialize left and right pointers
2. While left <= right:
   - Calculate mid = (left + right) / 2
   - If target found at mid, return
   - If target > mid, search right half
   - If target < mid, search left half
3. Return not found
    `,
    whenToUse: [
      "Array is sorted",
      "Need O(log n) search time",
      "Finding target value or insertion position",
      "Search space can be divided",
      "'Minimize maximum' or 'maximize minimum' problems"
    ],
    commonMistakes: [
      "Integer overflow in mid calculation",
      "Incorrect boundary updates (left = mid vs left = mid + 1)",
      "Infinite loops from wrong boundary conditions",
      "Not handling duplicates correctly"
    ],
    exampleProblems: [
      "Binary Search",
      "Search in Rotated Sorted Array",
      "Find Minimum in Rotated Sorted Array",
      "Koko Eating Bananas"
    ],
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1) iterative, O(log n) recursive"
  },
  {
    pattern: "Trees & BST",
    description: "Traversing and manipulating tree data structures",
    intuition: "A tree is like a family tree or organizational chart. Each node can have children, and you can explore it in different orders: visit parents before children (pre-order), children before parents (post-order), or level by level (BFS).",
    pseudocode: `
DFS (Recursive):
1. Base case: if node is null, return
2. Process current node
3. Recursively call on left child
4. Recursively call on right child

BFS:
1. Create queue with root
2. While queue not empty:
   - Dequeue node
   - Process node
   - Enqueue children
    `,
    whenToUse: [
      "Hierarchical data",
      "Tree traversal problems",
      "Finding paths or ancestors",
      "Level-order operations",
      "BST property validation"
    ],
    commonMistakes: [
      "Not handling null nodes",
      "Confusing pre/in/post order traversals",
      "Stack overflow from deep recursion",
      "Not considering unbalanced trees"
    ],
    exampleProblems: [
      "Invert Binary Tree",
      "Maximum Depth of Binary Tree",
      "Validate BST",
      "Level Order Traversal",
      "Lowest Common Ancestor"
    ],
    timeComplexity: "O(n) for traversals",
    spaceComplexity: "O(h) where h is height"
  },
  {
    pattern: "Graphs",
    description: "Traversing and analyzing graph structures using BFS/DFS",
    intuition: "Graphs are like maps of cities connected by roads. BFS is like exploring by distance (closest cities first), while DFS is like following one road as far as it goes before backtracking.",
    pseudocode: `
BFS:
1. Create queue with starting node
2. Mark starting node as visited
3. While queue not empty:
   - Dequeue node
   - Process node
   - Enqueue unvisited neighbors
   - Mark neighbors as visited

DFS:
1. Mark current node as visited
2. Process node
3. For each unvisited neighbor:
   - Recursively call DFS
    `,
    whenToUse: [
      "Connected components",
      "Shortest path (unweighted)",
      "Cycle detection",
      "Topological sorting",
      "Grid-based problems"
    ],
    commonMistakes: [
      "Not tracking visited nodes (infinite loops)",
      "Confusing BFS and DFS use cases",
      "Not handling disconnected graphs",
      "Incorrect neighbor traversal in grids"
    ],
    exampleProblems: [
      "Number of Islands",
      "Clone Graph",
      "Course Schedule",
      "Pacific Atlantic Water Flow"
    ],
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)"
  },
  {
    pattern: "Dynamic Programming",
    description: "Breaking down problems into overlapping subproblems",
    intuition: "Like climbing stairs - instead of recalculating how many ways to reach each step, you remember (memoize) the answer and build up from smaller problems. If you know ways to reach step 5 and step 6, you can easily find ways to reach step 7.",
    pseudocode: `
1. Define dp array/table
2. Initialize base cases
3. For each subproblem:
   - Calculate using previous results
   - Store in dp array
4. Return final result from dp array
    `,
    whenToUse: [
      "Optimization problems (max/min)",
      "Counting problems",
      "Overlapping subproblems",
      "Can be solved recursively with memoization"
    ],
    commonMistakes: [
      "Not identifying the recurrence relation",
      "Incorrect base case initialization",
      "Off-by-one errors in array indexing",
      "Not optimizing space complexity"
    ],
    exampleProblems: [
      "Climbing Stairs",
      "House Robber",
      "Coin Change",
      "Longest Common Subsequence"
    ],
    timeComplexity: "O(n) to O(n²) typically",
    spaceComplexity: "O(n) but often optimizable to O(1)"
  },
  {
    pattern: "Stack & Queue",
    description: "Using LIFO and FIFO data structures for specific problem patterns",
    intuition: "A stack is like a pile of plates - last one on, first one off. Perfect for tracking nested structures or 'undoing' operations. A queue is like a line at a store - first come, first served.",
    pseudocode: `
Stack:
1. Push elements onto stack
2. When condition met, pop elements
3. Process popped elements
4. Continue until stack empty or problem solved

Monotonic Stack:
1. For each element:
   - Pop while stack top violates condition
   - Process what was popped
   - Push current element
    `,
    whenToUse: [
      "Matching parentheses/brackets",
      "Next greater/smaller element",
      "Calculator problems",
      "Undo mechanisms",
      "DFS traversal"
    ],
    commonMistakes: [
      "Not checking if stack/queue is empty before pop",
      "Incorrect monotonic stack logic",
      "Using wrong data structure (stack vs queue)",
      "Not handling edge cases"
    ],
    exampleProblems: [
      "Valid Parentheses",
      "Min Stack",
      "Daily Temperatures",
      "Largest Rectangle in Histogram"
    ],
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)"
  },
  {
    pattern: "Heap / Priority Queue",
    description: "Using heaps for efficient min/max operations",
    intuition: "A heap is like a tournament bracket that always knows who's winning. It can instantly tell you the minimum or maximum element and efficiently maintain this property when elements change.",
    pseudocode: `
1. Create min or max heap
2. Add elements to heap
3. Extract min/max as needed
4. Heap automatically maintains order
5. Return results
    `,
    whenToUse: [
      "Finding top K elements",
      "Kth largest/smallest element",
      "Merge K sorted lists",
      "Running median",
      "Task scheduling"
    ],
    commonMistakes: [
      "Confusing min heap and max heap",
      "Not maintaining heap size for 'K' problems",
      "Inefficient heap operations",
      "Not considering heap time complexity"
    ],
    exampleProblems: [
      "Kth Largest Element",
      "Top K Frequent Elements",
      "Find Median from Data Stream",
      "Task Scheduler"
    ],
    timeComplexity: "O(log n) for insert/delete",
    spaceComplexity: "O(n)"
  },
  {
    pattern: "Backtracking",
    description: "Exploring all possibilities by building candidates and abandoning invalid ones",
    intuition: "Like solving a maze - try a path, if it doesn't work, back up and try another. You systematically explore all possibilities but 'prune' paths that can't lead to a solution.",
    pseudocode: `
1. Define recursive function
2. Base case: valid solution found
3. For each choice:
   - Make choice
   - Recursively explore
   - Undo choice (backtrack)
4. Return all valid solutions
    `,
    whenToUse: [
      "Generate all combinations/permutations",
      "Subset problems",
      "Constraint satisfaction",
      "Puzzle solving",
      "Path finding with constraints"
    ],
    commonMistakes: [
      "Not properly undoing choices (backtracking)",
      "Not pruning invalid branches early",
      "Incorrect base case",
      "Modifying shared state incorrectly"
    ],
    exampleProblems: [
      "Subsets",
      "Permutations",
      "Combinations",
      "Word Search",
      "N-Queens"
    ],
    timeComplexity: "Exponential (2^n or n!)",
    spaceComplexity: "O(n) for recursion depth"
  }
];

async function seedPatterns() {
  try {
    console.log('Initializing Weaviate schema...');
    await ragService.initializeSchema();

    console.log('Storing patterns in vector database...');
    for (const pattern of patterns) {
      await ragService.storePattern(pattern);
    }

    console.log(`Successfully seeded ${patterns.length} patterns!`);
  } catch (error) {
    console.error('Error seeding patterns:', error);
    process.exit(1);
  }
}

seedPatterns();