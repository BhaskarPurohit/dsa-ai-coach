// backend/src/scripts/importProblems.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from '../models/Problem';

dotenv.config();

const problems = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "easy",
    pattern: "Arrays & Hashing",
    topic: "arrays",
    order: 1,
    leetcodeLink: "https://leetcode.com/problems/two-sum/",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists"
    ],
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]"
      }
    ],
    testCases: [
      {
        input: { nums: [2, 7, 11, 15], target: 9 },
        expectedOutput: [0, 1]
      },
      {
        input: { nums: [3, 2, 4], target: 6 },
        expectedOutput: [1, 2]
      },
      {
        input: { nums: [3, 3], target: 6 },
        expectedOutput: [0, 1]
      }
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {
    // Write your code here
    
}`,
      python: `def twoSum(nums, target):
    # Write your code here
    pass`
    },
    solution: {
      javascript: `function twoSum(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        map.set(nums[i], i);
    }
    
    return [];
}`,
      python: `def twoSum(nums, target):
    seen = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        
        if complement in seen:
            return [seen[complement], i]
        
        seen[num] = i
    
    return []`
    },
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    hints: [
      "Think about what data structure allows O(1) lookup time.",
      "A hash map can store numbers you've seen along with their indices.",
      "For each number, calculate what its complement would need to be, then check if you've seen that complement before."
    ],
    tags: ["array", "hash-table"],
    companies: ["Google", "Amazon", "Microsoft", "Facebook"]
  },
  {
    id: 2,
    title: "Valid Anagram",
    difficulty: "easy",
    pattern: "Arrays & Hashing",
    topic: "strings",
    order: 2,
    leetcodeLink: "https://leetcode.com/problems/valid-anagram/",
    description: "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
    constraints: [
      "1 <= s.length, t.length <= 5 * 10^4",
      "s and t consist of lowercase English letters"
    ],
    examples: [
      {
        input: 's = "anagram", t = "nagaram"',
        output: "true"
      },
      {
        input: 's = "rat", t = "car"',
        output: "false"
      }
    ],
    testCases: [
      {
        input: { s: "anagram", t: "nagaram" },
        expectedOutput: true
      },
      {
        input: { s: "rat", t: "car" },
        expectedOutput: false
      },
      {
        input: { s: "listen", t: "silent" },
        expectedOutput: true
      }
    ],
    starterCode: {
      javascript: `function isAnagram(s, t) {
    // Write your code here
    
}`,
      python: `def isAnagram(s, t):
    # Write your code here
    pass`
    },
    solution: {
      javascript: `function isAnagram(s, t) {
    if (s.length !== t.length) return false;
    
    const count = {};
    
    for (let char of s) {
        count[char] = (count[char] || 0) + 1;
    }
    
    for (let char of t) {
        if (!count[char]) return false;
        count[char]--;
    }
    
    return true;
}`,
      python: `def isAnagram(s, t):
    if len(s) != len(t):
        return False
    
    count = {}
    
    for char in s:
        count[char] = count.get(char, 0) + 1
    
    for char in t:
        if char not in count:
            return False
        count[char] -= 1
        if count[char] < 0:
            return False
    
    return True`
    },
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    hints: [
      "What if the strings have different lengths?",
      "Count the frequency of each character in both strings.",
      "A hash map can help track character frequencies."
    ],
    tags: ["hash-table", "string", "sorting"],
    companies: ["Amazon", "Bloomberg", "Facebook"]
  },
  {
    id: 3,
    title: "Contains Duplicate",
    difficulty: "easy",
    pattern: "Arrays & Hashing",
    topic: "arrays",
    order: 3,
    leetcodeLink: "https://leetcode.com/problems/contains-duplicate/",
    description: "Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.",
    constraints: [
      "1 <= nums.length <= 10^5",
      "-10^9 <= nums[i] <= 10^9"
    ],
    examples: [
      {
        input: "nums = [1,2,3,1]",
        output: "true"
      },
      {
        input: "nums = [1,2,3,4]",
        output: "false"
      }
    ],
    testCases: [
      {
        input: { nums: [1, 2, 3, 1] },
        expectedOutput: true
      },
      {
        input: { nums: [1, 2, 3, 4] },
        expectedOutput: false
      },
      {
        input: { nums: [1, 1, 1, 3, 3, 4, 3, 2, 4, 2] },
        expectedOutput: true
      }
    ],
    starterCode: {
      javascript: `function containsDuplicate(nums) {
    // Write your code here
    
}`,
      python: `def containsDuplicate(nums):
    # Write your code here
    pass`
    },
    solution: {
      javascript: `function containsDuplicate(nums) {
    const seen = new Set();
    
    for (let num of nums) {
        if (seen.has(num)) {
            return true;
        }
        seen.add(num);
    }
    
    return false;
}`,
      python: `def containsDuplicate(nums):
    seen = set()
    
    for num in nums:
        if num in seen:
            return True
        seen.add(num)
    
    return False`
    },
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    hints: [
      "What data structure can efficiently check if an element exists?",
      "A Set automatically handles uniqueness.",
      "As you iterate, check if you've seen the current number before."
    ],
    tags: ["array", "hash-table", "sorting"],
    companies: ["Google", "Amazon", "Apple"]
  },
  // Add more problems for other patterns...
];

async function importProblems() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Clear existing problems
    await Problem.deleteMany({});
    console.log('Cleared existing problems');

    // Insert new problems
    await Problem.insertMany(problems);
    console.log(`Imported ${problems.length} problems successfully`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error importing problems:', error);
    process.exit(1);
  }
}

importProblems();