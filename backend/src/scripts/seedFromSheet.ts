/**
 * seedFromSheet.ts
 * Seeds MongoDB with problems parsed from the DSA cheat sheet Excel.
 *
 * Strategy:
 *   - Problems with full starter code below are "seeded = true" (ready to use)
 *   - All other problems from the sheet are imported as stubs (seeded = false)
 *     with placeholder starter code. You can fill them in over time.
 *
 * Run: npx ts-node src/scripts/seedFromSheet.ts
 * Safe to re-run — uses upsert (won't duplicate).
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import * as path from 'path';
import Problem from '../models/Problem';

dotenv.config({ path: path.join(__dirname, '../../.env') });

// ─── Fully implemented problems (starter code + test cases + solution) ────────
// Add more here as you build them out. Pattern + title must match the Excel.

const SEEDED_PROBLEMS: Record<string, any> = {

  // ── Two Pointers ────────────────────────────────────────────────────────────
  'Pair with Target Sum': {
    description: `Given a sorted array of numbers and a target sum, find a pair that adds up to the target. Return the indices of the two numbers (1-indexed) or [-1, -1] if no pair exists.`,
    constraints: ['Array is sorted in ascending order', '2 <= arr.length <= 10^4', 'The target is guaranteed to have at most one pair'],
    examples: [
      { input: 'arr = [1, 2, 3, 4, 6], target = 6', output: '[1, 3]', explanation: 'arr[1] + arr[3] = 2 + 4 = 6' },
      { input: 'arr = [2, 5, 9, 11], target = 11', output: '[0, 2]' },
    ],
    testCases: [
      { input: { arr: [1, 2, 3, 4, 6], target: 6 }, expectedOutput: [1, 3] },
      { input: { arr: [2, 5, 9, 11], target: 11 }, expectedOutput: [0, 2] },
      { input: { arr: [1, 3, 5, 7], target: 10 }, expectedOutput: [1, 3] },
      { input: { arr: [1, 2, 3], target: 100 }, expectedOutput: [-1, -1] },
    ],
    starterCode: {
      javascript: `function pairWithTargetSum(arr, target) {
  // Use two pointers: left at start, right at end
  // Since array is sorted, if sum > target move right left, else move left right

}`,
      python: `def pair_with_target_sum(arr, target):
    # Use two pointers: left at start, right at end
    # Since array is sorted, if sum > target move right left, else move left right
    pass`,
    },
    solution: {
      javascript: `function pairWithTargetSum(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) return [left, right];
    if (sum < target) left++;
    else right--;
  }
  return [-1, -1];
}`,
      python: `def pair_with_target_sum(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        s = arr[left] + arr[right]
        if s == target:
            return [left, right]
        elif s < target:
            left += 1
        else:
            right -= 1
    return [-1, -1]`,
    },
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Since the array is sorted, what can you say about the sum when the right pointer moves left?',
      'Use left = 0, right = n-1. If arr[left] + arr[right] > target, which pointer should move?',
      'While left < right: compute sum. If sum == target return [left, right]. If sum < target, left++. Else right--.',
    ],
  },

  'Remove Duplicates': {
    description: `Given a sorted array, remove duplicates in-place such that each element appears only once. Return the new length. Do not allocate extra space — modify the input array in-place.`,
    constraints: ['Array is sorted', '0 <= nums.length <= 3 * 10^4'],
    examples: [
      { input: 'nums = [2, 3, 3, 3, 6, 9, 9]', output: '4', explanation: 'First 4 elements become [2, 3, 6, 9]' },
    ],
    testCases: [
      { input: { nums: [2, 3, 3, 3, 6, 9, 9] }, expectedOutput: 4 },
      { input: { nums: [1, 1, 2] }, expectedOutput: 2 },
      { input: { nums: [1] }, expectedOutput: 1 },
      { input: { nums: [] }, expectedOutput: 0 },
    ],
    starterCode: {
      javascript: `function removeDuplicates(nums) {
  // One pointer to track the next unique position
  // Another pointer to scan through the array

}`,
      python: `def remove_duplicates(nums):
    # One pointer to track the next unique position
    # Another pointer to scan through the array
    pass`,
    },
    solution: {
      javascript: `function removeDuplicates(nums) {
  if (nums.length === 0) return 0;
  let nextNonDuplicate = 1;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[i - 1]) {
      nums[nextNonDuplicate] = nums[i];
      nextNonDuplicate++;
    }
  }
  return nextNonDuplicate;
}`,
      python: `def remove_duplicates(nums):
    if not nums:
        return 0
    next_non_duplicate = 1
    for i in range(1, len(nums)):
        if nums[i] != nums[i - 1]:
            nums[next_non_duplicate] = nums[i]
            next_non_duplicate += 1
    return next_non_duplicate`,
    },
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Keep one pointer at position 1 (the "write" pointer). When do you advance it?',
      'The write pointer advances only when you find an element different from the previous one.',
      'for i in 1..n: if nums[i] != nums[i-1]: nums[write] = nums[i]; write++',
    ],
  },

  // ── Sliding Window ──────────────────────────────────────────────────────────
  'Maximum Sum Subarray of Size K': {
    description: `Given an array of positive numbers and a positive number k, find the maximum sum of any contiguous subarray of size k.`,
    constraints: ['1 <= k <= arr.length', 'All elements are positive'],
    examples: [
      { input: 'arr = [2, 1, 5, 1, 3, 2], k = 3', output: '9', explanation: 'Subarray [5, 1, 3] has the maximum sum of 9' },
      { input: 'arr = [2, 3, 4, 1, 5], k = 2', output: '7', explanation: '[3, 4]' },
    ],
    testCases: [
      { input: { arr: [2, 1, 5, 1, 3, 2], k: 3 }, expectedOutput: 9 },
      { input: { arr: [2, 3, 4, 1, 5], k: 2 }, expectedOutput: 7 },
      { input: { arr: [1, 1, 1, 1], k: 2 }, expectedOutput: 2 },
    ],
    starterCode: {
      javascript: `function maxSumSubarrayOfSizeK(arr, k) {
  // Slide a window of size k across the array
  // Keep a running sum — add the new element, remove the old one

}`,
      python: `def max_sum_subarray_of_size_k(arr, k):
    # Slide a window of size k across the array
    # Keep a running sum — add the new element, remove the old one
    pass`,
    },
    solution: {
      javascript: `function maxSumSubarrayOfSizeK(arr, k) {
  let maxSum = 0, windowSum = 0, windowStart = 0;
  for (let windowEnd = 0; windowEnd < arr.length; windowEnd++) {
    windowSum += arr[windowEnd];
    if (windowEnd >= k - 1) {
      maxSum = Math.max(maxSum, windowSum);
      windowSum -= arr[windowStart];
      windowStart++;
    }
  }
  return maxSum;
}`,
      python: `def max_sum_subarray_of_size_k(arr, k):
    max_sum = window_sum = 0
    window_start = 0
    for window_end in range(len(arr)):
        window_sum += arr[window_end]
        if window_end >= k - 1:
            max_sum = max(max_sum, window_sum)
            window_sum -= arr[window_start]
            window_start += 1
    return max_sum`,
    },
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Once the window reaches size k, what do you need to do when you add a new element?',
      'Subtract arr[windowStart] from the sum and increment windowStart to slide the window.',
      'Track windowStart and windowEnd. When windowEnd - windowStart + 1 == k: update maxSum, subtract arr[windowStart], windowStart++.',
    ],
  },

  'Smallest Subarray with a given sum': {
    description: `Given an array of positive numbers and a positive number s, find the length of the smallest contiguous subarray whose sum is greater than or equal to s. Return 0 if no such subarray exists.`,
    constraints: ['All elements are positive', '1 <= s <= 10^9'],
    examples: [
      { input: 'arr = [2, 1, 5, 2, 3, 2], s = 7', output: '2', explanation: '[5, 2] or [5, 3] both have sum >= 7' },
      { input: 'arr = [2, 1, 5, 2, 8], s = 7', output: '1', explanation: '[8]' },
    ],
    testCases: [
      { input: { arr: [2, 1, 5, 2, 3, 2], s: 7 }, expectedOutput: 2 },
      { input: { arr: [2, 1, 5, 2, 8], s: 7 }, expectedOutput: 1 },
      { input: { arr: [3, 4, 1, 1, 6], s: 8 }, expectedOutput: 3 },
      { input: { arr: [1, 1, 1], s: 100 }, expectedOutput: 0 },
    ],
    starterCode: {
      javascript: `function smallestSubarrayWithGivenSum(arr, s) {
  // Dynamic window — expand right until sum >= s, then shrink from left

}`,
      python: `def smallest_subarray_with_given_sum(arr, s):
    # Dynamic window — expand right until sum >= s, then shrink from left
    pass`,
    },
    solution: {
      javascript: `function smallestSubarrayWithGivenSum(arr, s) {
  let minLength = Infinity, windowSum = 0, windowStart = 0;
  for (let windowEnd = 0; windowEnd < arr.length; windowEnd++) {
    windowSum += arr[windowEnd];
    while (windowSum >= s) {
      minLength = Math.min(minLength, windowEnd - windowStart + 1);
      windowSum -= arr[windowStart];
      windowStart++;
    }
  }
  return minLength === Infinity ? 0 : minLength;
}`,
      python: `def smallest_subarray_with_given_sum(arr, s):
    import math
    min_length = math.inf
    window_sum = window_start = 0
    for window_end in range(len(arr)):
        window_sum += arr[window_end]
        while window_sum >= s:
            min_length = min(min_length, window_end - window_start + 1)
            window_sum -= arr[window_start]
            window_start += 1
    return 0 if min_length == math.inf else min_length`,
    },
    timeComplexity: 'O(n) — each element enters and exits the window once',
    spaceComplexity: 'O(1)',
    hints: [
      'This window is dynamic — it should shrink. When should you shrink it?',
      'Once windowSum >= s, record the length and try to shrink from the left.',
      'while windowSum >= s: update minLength; subtract arr[windowStart]; windowStart++',
    ],
  },

  // ── Kadane ──────────────────────────────────────────────────────────────────
  'Maximum subarray sum': {
    description: `Given an integer array, find the subarray with the largest sum and return its sum.`,
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    examples: [
      { input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]', output: '6', explanation: '[4, -1, 2, 1] has the largest sum = 6' },
      { input: 'nums = [1]', output: '1' },
      { input: 'nums = [5, 4, -1, 7, 8]', output: '23' },
    ],
    testCases: [
      { input: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] }, expectedOutput: 6 },
      { input: { nums: [1] }, expectedOutput: 1 },
      { input: { nums: [5, 4, -1, 7, 8] }, expectedOutput: 23 },
      { input: { nums: [-3, -2, -1] }, expectedOutput: -1 },
    ],
    starterCode: {
      javascript: `function maxSubarraySum(nums) {
  // At each index: should I extend the previous subarray or start fresh?
  // If the running sum becomes negative, starting fresh is always better.

}`,
      python: `def max_subarray_sum(nums):
    # At each index: should I extend the previous subarray or start fresh?
    # If the running sum becomes negative, starting fresh is always better.
    pass`,
    },
    solution: {
      javascript: `function maxSubarraySum(nums) {
  let maxSum = nums[0];
  let currentSum = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  return maxSum;
}`,
      python: `def max_subarray_sum(nums):
    max_sum = current_sum = nums[0]
    for num in nums[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    return max_sum`,
    },
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Why is it always safe to "start fresh" when the running sum becomes negative?',
      'current_sum = max(nums[i], current_sum + nums[i]) — what does this line decide?',
      'Initialize both maxSum and currentSum to nums[0] (not 0 — handles all-negative arrays).',
    ],
  },

  // ── Binary Search ───────────────────────────────────────────────────────────
  'Binary search basic': {
    description: `Given a sorted array of integers and a target value, return the index of target if it exists. Otherwise return -1.`,
    constraints: ['Array is sorted in ascending order', 'All integers are unique', '-10^4 <= target <= 10^4'],
    examples: [
      { input: 'nums = [-1, 0, 3, 5, 9, 12], target = 9', output: '4' },
      { input: 'nums = [-1, 0, 3, 5, 9, 12], target = 2', output: '-1' },
    ],
    testCases: [
      { input: { nums: [-1, 0, 3, 5, 9, 12], target: 9 }, expectedOutput: 4 },
      { input: { nums: [-1, 0, 3, 5, 9, 12], target: 2 }, expectedOutput: -1 },
      { input: { nums: [5], target: 5 }, expectedOutput: 0 },
      { input: { nums: [1, 2, 3], target: 3 }, expectedOutput: 2 },
    ],
    starterCode: {
      javascript: `function binarySearch(nums, target) {
  // Repeatedly halve the search space
  // mid = left + Math.floor((right - left) / 2)  ← avoids overflow

}`,
      python: `def binary_search(nums, target):
    # Repeatedly halve the search space
    # mid = left + (right - left) // 2  ← avoids overflow
    pass`,
    },
    solution: {
      javascript: `function binarySearch(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] === target) return mid;
    else if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
      python: `def binary_search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
    },
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'What does it mean when nums[mid] < target? Which half of the array can you eliminate?',
      'Three cases: mid == target (found), mid < target (go right: left = mid+1), mid > target (go left: right = mid-1).',
      'Use mid = left + (right - left) // 2 to avoid integer overflow. Loop condition: left <= right.',
    ],
  },

  // ── Stack ───────────────────────────────────────────────────────────────────
  'Balanced Parentheses': {
    description: `Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. A string is valid if every open bracket is closed by the same type of bracket in the correct order.`,
    constraints: ['1 <= s.length <= 10^4', 's consists of bracket characters only'],
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
      { input: 's = "([)]"', output: 'false' },
    ],
    testCases: [
      { input: { s: '()' }, expectedOutput: true },
      { input: { s: '()[]{}' }, expectedOutput: true },
      { input: { s: '(]' }, expectedOutput: false },
      { input: { s: '([)]' }, expectedOutput: false },
      { input: { s: '{[]}' }, expectedOutput: true },
      { input: { s: '' }, expectedOutput: true },
    ],
    starterCode: {
      javascript: `function isValid(s) {
  // Push open brackets onto a stack
  // When you see a close bracket, check if it matches the top of the stack

}`,
      python: `def is_valid(s):
    # Push open brackets onto a stack
    # When you see a close bracket, check if it matches the top of the stack
    pass`,
    },
    solution: {
      javascript: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if ('({['.includes(char)) {
      stack.push(char);
    } else {
      if (stack.length === 0 || stack[stack.length - 1] !== map[char]) return false;
      stack.pop();
    }
  }
  return stack.length === 0;
}`,
      python: `def is_valid(s):
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in '({[':
            stack.append(char)
        else:
            if not stack or stack[-1] != mapping[char]:
                return False
            stack.pop()
    return len(stack) == 0`,
    },
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'When you encounter a closing bracket, what do you need to check?',
      'Use a map: ) → (, } → {, ] → [. When you see a close bracket, pop the stack and compare.',
      'Edge cases: empty stack when you see a close bracket (return false), non-empty stack at the end (return false).',
    ],
  },

};

// ─── Stub template for unseeded problems ─────────────────────────────────────
function makeStub(title: string, pattern: string, patternId: string, difficulty: string, order: number, link: string) {
  const funcName = title
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .map((w, i) => i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join('');

  return {
    description: `Solve: ${title}. See ${link || 'the problem link'} for the full problem statement.`,
    constraints: [],
    examples: [],
    testCases: [
      { input: {}, expectedOutput: null },
    ],
    starterCode: {
      javascript: `// ${title}\n// Pattern: ${pattern}\nfunction ${funcName}() {\n  // TODO: implement\n}`,
      python: `# ${title}\n# Pattern: ${pattern}\ndef ${funcName.replace(/([A-Z])/g, '_$1').toLowerCase()}():\n    pass  # TODO: implement`,
    },
    solution: {
      javascript: `// See: ${link}`,
      python: `# See: ${link}`,
    },
    timeComplexity: 'TBD',
    spaceComplexity: 'TBD',
    hints: [`Think about the ${pattern} pattern. ${link ? 'See: ' + link : ''}`],
  };
}

async function seedFromSheet() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dsa-coach');
  console.log('✅ Connected to MongoDB');

  // Load parsed sheet data
  let sheetData: { flat: any[] };
  try {
    sheetData = require('./problems-from-sheet.json');
  } catch {
    console.error('❌ problems-from-sheet.json not found.');
    console.error('   Run first: npx ts-node src/scripts/parseSheet.ts');
    process.exit(1);
  }

  let inserted = 0, updated = 0, skipped = 0;

  for (const p of sheetData.flat) {
    const seededData = SEEDED_PROBLEMS[p.title];
    const isSeeded = Boolean(seededData);

    const problemData = isSeeded ? seededData : makeStub(
      p.title, p.pattern, p.patternId, p.difficulty, p.order, p.leetcodeLink
    );

    const doc = {
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      pattern: p.pattern,
      topic: p.patternId,
      order: p.order,
      leetcodeLink: p.leetcodeLink || '',
      tags: [p.patternId],
      ...problemData,
    };

    const existing = await Problem.findOne({ id: p.id });
    if (existing) {
      // Only update if this is a seeded problem replacing a stub
      if (isSeeded && !existing.testCases?.[0]?.expectedOutput) {
        await Problem.updateOne({ id: p.id }, doc);
        updated++;
      } else {
        skipped++;
      }
    } else {
      await Problem.create(doc);
      inserted++;
    }
  }

  const seededCount = Object.keys(SEEDED_PROBLEMS).length;
  console.log(`\n✅ MongoDB seed complete`);
  console.log(`   Inserted: ${inserted} problems`);
  console.log(`   Updated:  ${updated} stubs → seeded`);
  console.log(`   Skipped:  ${skipped} (already exist)`);
  console.log(`\n   Fully implemented: ${seededCount} problems`);
  console.log(`   Stubs (need starter code): ${sheetData.flat.length - seededCount}`);
  console.log('\n   To add more fully implemented problems:');
  console.log('   Edit SEEDED_PROBLEMS in backend/src/scripts/seedFromSheet.ts');

  await mongoose.disconnect();
}

seedFromSheet().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
