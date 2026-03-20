/**
 * setupWeaviate.ts
 * Creates the PatternKnowledge class in Weaviate and seeds it with
 * pattern knowledge for all 14 patterns from the cheat sheet.
 *
 * Run: npx ts-node src/scripts/setupWeaviate.ts
 * Safe to re-run — skips creation if schema already exists.
 */

import weaviate from 'weaviate-ts-client';
import dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const rawUrl = process.env.WEAVIATE_URL || 'http://localhost:8080';
const parsed = new URL(rawUrl);

const client = weaviate.client({
  scheme: parsed.protocol.replace(':', '') as 'http' | 'https',
  host: parsed.host,
  ...(process.env.WEAVIATE_API_KEY
    ? { apiKey: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY) }
    : {}),
});

// ─── Pattern knowledge base ──────────────────────────────────────────────────
// Each entry is what the RAG retrieves when a user starts learning a pattern.
// Add richer content here over time (YouTube transcript chunks, etc.)

const PATTERN_KNOWLEDGE = [
  {
    pattern: 'Two Pointers',
    patternId: 'two-pointers',
    description: 'Use two indices that move toward each other or in the same direction to solve array/string problems in O(n) instead of O(n²).',
    intuition: 'Instead of checking every pair with a nested loop, start one pointer at the left and one at the right. Move them based on a condition (sum too big → move right pointer left; sum too small → move left pointer right). Works on sorted arrays.',
    pseudocode: `left = 0, right = n-1
while left < right:
    current = arr[left] + arr[right]
    if current == target: return [left, right]
    elif current < target: left++
    else: right--`,
    whenToUse: [
      'Problem involves a sorted array or string',
      'You need to find a pair, triplet, or subarray with a given property',
      'Brute force would be O(n²) nested loops',
      'Problem says "two numbers that sum to target"',
    ],
    commonMistakes: [
      'Forgetting to sort the array first',
      'Using on unsorted data (will give wrong answers)',
      'Off-by-one: condition should be left < right, not left <= right',
      'Not handling duplicates when the problem asks for unique pairs',
    ],
    exampleProblems: [
      'Pair with Target Sum', 'Three Sum', 'Remove Duplicates',
      'Squaring a Sorted Array', 'Dutch National Flag',
    ],
    timeComplexity: 'O(n) — single pass',
    spaceComplexity: 'O(1) — no extra space',
  },
  {
    pattern: 'Fast & Slow Pointers',
    patternId: 'fast-slow-pointers',
    description: 'Use two pointers moving at different speeds (fast moves 2 steps, slow moves 1) to detect cycles or find the middle of a linked list.',
    intuition: 'If there\'s a cycle, the fast pointer will eventually lap the slow pointer — they\'ll meet inside the cycle. If there\'s no cycle, the fast pointer reaches null first. The meeting point gives you information about cycle length and start.',
    pseudocode: `slow = head, fast = head
while fast and fast.next:
    slow = slow.next
    fast = fast.next.next
    if slow == fast: # cycle detected
        return True
return False  # no cycle`,
    whenToUse: [
      'Detect a cycle in a linked list or sequence',
      'Find the start of a cycle',
      'Find the middle of a linked list',
      'Check if a number is a "happy number"',
      'Problem involves a sequence that might loop',
    ],
    commonMistakes: [
      'Checking fast == slow before moving (need to move first)',
      'Forgetting to check fast.next != null before fast.next.next',
      'Confusing cycle detection with cycle start finding (need second phase)',
    ],
    exampleProblems: [
      'LinkedList Cycle', 'Happy Number', 'Middle of LinkedList',
      'Find Duplicate Number',
    ],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  {
    pattern: 'Sliding Window',
    patternId: 'sliding-window',
    description: 'Maintain a window (subarray/substring) that slides over the data, expanding or shrinking based on a condition, to find optimal subarrays in O(n).',
    intuition: 'Instead of recalculating from scratch for every subarray, keep a running aggregate. Expand the window by moving the right pointer; shrink it by moving the left pointer when a constraint is violated.',
    pseudocode: `left = 0, window_state = {}
for right in range(n):
    add arr[right] to window_state
    while window violates constraint:
        remove arr[left] from window_state
        left++
    update answer with current window`,
    whenToUse: [
      'Contiguous subarray or substring problem',
      '"Longest/shortest subarray with property X"',
      '"Find all substrings containing all characters of pattern"',
      'Maximum sum subarray of size k',
    ],
    commonMistakes: [
      'Forgetting to shrink the window (infinite expansion)',
      'Off-by-one in window size calculation (right - left + 1)',
      'Not resetting window state when restarting',
      'Using fixed window approach when window should be dynamic',
    ],
    exampleProblems: [
      'Maximum Sum Subarray of Size K', 'Longest Substring with K Distinct Chars',
      'Fruits into Baskets', 'Permutation in a String',
    ],
    timeComplexity: 'O(n) — each element enters and leaves the window at most once',
    spaceComplexity: 'O(k) where k is the window or alphabet size',
  },
  {
    pattern: 'Kadane',
    patternId: 'kadane',
    description: 'Find the maximum (or minimum) sum contiguous subarray in O(n) by tracking the best subarray ending at each position.',
    intuition: 'At each index, decide: should I extend the previous subarray, or start a new one here? If the previous running sum is negative, it drags us down — start fresh. max_ending_here = max(nums[i], max_ending_here + nums[i]).',
    pseudocode: `max_sum = nums[0]
current_sum = nums[0]
for i in range(1, n):
    current_sum = max(nums[i], current_sum + nums[i])
    max_sum = max(max_sum, current_sum)
return max_sum`,
    whenToUse: [
      'Maximum or minimum sum contiguous subarray',
      'Maximum product subarray (track both max and min)',
      'Any problem asking for the best contiguous segment',
    ],
    commonMistakes: [
      'Initializing max_sum = 0 (fails for all-negative arrays)',
      'Not handling the case where all numbers are negative',
      'Confusing Kadane with prefix sum (Kadane is for contiguous, max/min)',
    ],
    exampleProblems: [
      'Maximum Subarray Sum', 'Maximum Product Subarray',
      'Maximum Sum Circular Subarray',
    ],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  {
    pattern: 'Prefix Sum',
    patternId: 'prefix-sum',
    description: 'Precompute cumulative sums so any subarray sum query [l, r] can be answered in O(1) instead of O(n).',
    intuition: 'prefix[i] = sum of arr[0..i]. Sum of arr[l..r] = prefix[r] - prefix[l-1]. Store prefix sums in a hash map to find subarrays with a given sum in O(n).',
    pseudocode: `prefix = {0: -1}  # sum -> index
running = 0
for i, num in enumerate(nums):
    running += num
    if running - k in prefix:
        found subarray ending at i
    if running not in prefix:
        prefix[running] = i`,
    whenToUse: [
      'Subarray sum equals k',
      'Number of subarrays divisible by k',
      'Range sum queries (multiple queries on same array)',
      '"Find subarray with sum = target"',
    ],
    commonMistakes: [
      'Forgetting to seed the hash map with {0: -1} or {0: 0}',
      'Confusing the order of lookup vs insert (look up BEFORE inserting)',
      'Using prefix sum when you need maximum subarray (use Kadane instead)',
    ],
    exampleProblems: [
      'Subarray Sum Equals K', 'Find Pivot Index',
      'Contiguous Array', 'Subarray Sums Divisible by K',
    ],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n) for the hash map',
  },
  {
    pattern: 'Merge Intervals',
    patternId: 'merge-intervals',
    description: 'Sort intervals by start time, then merge overlapping ones by comparing each interval\'s start against the previous interval\'s end.',
    intuition: 'After sorting, two intervals overlap if the next one starts before the current one ends (next.start <= current.end). If they overlap, extend the current end to max(current.end, next.end).',
    pseudocode: `intervals.sort(key=lambda x: x[0])
merged = [intervals[0]]
for start, end in intervals[1:]:
    if start <= merged[-1][1]:  # overlaps
        merged[-1][1] = max(merged[-1][1], end)
    else:
        merged.append([start, end])`,
    whenToUse: [
      'Merge overlapping intervals',
      'Insert a new interval into sorted intervals',
      'Find intersection of two interval lists',
      'Schedule problems (meeting rooms, CPU load)',
    ],
    commonMistakes: [
      'Forgetting to sort first',
      'Using < instead of <= for overlap check (missing touching intervals)',
      'Not taking max of end times when merging',
    ],
    exampleProblems: [
      'Merge Intervals', 'Insert Interval',
      'Intervals Intersection', 'Minimum Meeting Rooms',
    ],
    timeComplexity: 'O(n log n) for sorting, O(n) for merge pass',
    spaceComplexity: 'O(n)',
  },
  {
    pattern: 'Cyclic Sort',
    patternId: 'cyclic-sort',
    description: 'Sort arrays containing numbers in range [1, n] or [0, n] in O(n) by placing each number at its correct index.',
    intuition: 'If the array contains numbers 1 to n, number i belongs at index i-1. Walk through: if nums[i] is not at its correct index, swap it there. Once placed, it never moves again.',
    pseudocode: `i = 0
while i < n:
    correct = nums[i] - 1  # where nums[i] should be
    if nums[i] != nums[correct]:
        swap(nums[i], nums[correct])
    else:
        i++
# Now find missing/duplicate by scanning for nums[i] != i+1`,
    whenToUse: [
      'Array contains numbers in range [1, n]',
      'Find missing numbers in range',
      'Find duplicate numbers in range',
      'Find the corrupt pair (one missing, one duplicate)',
    ],
    commonMistakes: [
      'Incrementing i when you should be swapping (infinite loop)',
      'Using nums[i] - 1 vs nums[i] (off-by-one based on 0-indexed vs 1-indexed)',
      'Not handling duplicates in the swap condition (causes infinite loop)',
    ],
    exampleProblems: [
      'Find the Missing Number', 'Find all Missing Numbers',
      'Find the Duplicate Number', 'First Missing Positive',
    ],
    timeComplexity: 'O(n) — each element placed at most twice',
    spaceComplexity: 'O(1)',
  },
  {
    pattern: 'In-place Reversal of a LinkedList',
    patternId: 'in-place-reversal-linkedlist',
    description: 'Reverse a linked list or a portion of it in-place using three pointers (prev, curr, next) without extra space.',
    intuition: 'To reverse: save next, point curr.next to prev, move prev to curr, move curr to saved next. Repeat. For partial reversal, navigate to the sublist start first.',
    pseudocode: `prev = None
curr = head
while curr:
    next_node = curr.next
    curr.next = prev
    prev = curr
    curr = next_node
return prev  # new head`,
    whenToUse: [
      'Reverse entire linked list',
      'Reverse a sublist between positions p and q',
      'Reverse every k elements',
      'Rotate a linked list',
    ],
    commonMistakes: [
      'Losing the reference to next node before changing pointers',
      'Not reconnecting the reversed sublist to the rest of the list',
      'Off-by-one: navigating to position p-1 vs p',
    ],
    exampleProblems: [
      'Reverse a LinkedList', 'Reverse a Sub-list',
      'Reverse every K-element Sub-list', 'Rotate a LinkedList',
    ],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  {
    pattern: 'Stack',
    patternId: 'stack',
    description: 'Use a LIFO stack to track "pending" elements that need to be matched or compared with future elements.',
    intuition: 'Push elements onto the stack. When the current element can resolve or match something on the stack (e.g., closing bracket matches opening), pop and process. Monotonic stack: only keep elements in increasing or decreasing order.',
    pseudocode: `stack = []
for char in s:
    if char is opening bracket:
        stack.append(char)
    elif char is closing bracket:
        if stack and stack[-1] matches:
            stack.pop()
        else:
            return False
return len(stack) == 0`,
    whenToUse: [
      'Matching/balancing problems (parentheses, brackets)',
      'Next greater/smaller element',
      'Monotonic stack for temperature/stock span problems',
      '"Undo" operations or backtracking through history',
    ],
    commonMistakes: [
      'Not checking if stack is empty before popping',
      'Confusing stack vs queue for the problem type',
      'Forgetting to check stack is empty at the end (unmatched opens)',
    ],
    exampleProblems: [
      'Valid Parentheses', 'Daily Temperatures', 'Next Greater Element',
      'Remove K Digits',
    ],
    timeComplexity: 'O(n) — each element pushed/popped at most once',
    spaceComplexity: 'O(n)',
  },
  {
    pattern: 'Binary Search',
    patternId: 'binary-search',
    description: 'Repeatedly halve the search space on a sorted array (or any monotonic function) to find a target in O(log n).',
    intuition: 'If arr[mid] == target, found. If arr[mid] < target, target is in the right half (left = mid + 1). If arr[mid] > target, target is in left half (right = mid - 1). For "binary search on answer", apply the same halving to the answer space.',
    pseudocode: `left, right = 0, len(arr) - 1
while left <= right:
    mid = left + (right - left) // 2  # avoid overflow
    if arr[mid] == target: return mid
    elif arr[mid] < target: left = mid + 1
    else: right = mid - 1
return -1`,
    whenToUse: [
      'Sorted array search',
      '"Find minimum X such that condition(X) is true" — binary search on answer',
      'Rotated sorted array problems',
      'Find first/last occurrence of element',
      'Koko eating bananas, ship packages — minimize maximum / maximize minimum',
    ],
    commonMistakes: [
      'Integer overflow: use mid = left + (right - left) // 2',
      'Infinite loop when left/right don\'t converge (wrong update rule)',
      'Using < instead of <= in while condition (misses single-element arrays)',
      'Not adjusting to find first/last occurrence (need to keep going after finding)',
    ],
    exampleProblems: [
      'Binary Search', 'Search in Rotated Sorted Array',
      'Koko Eating Bananas', 'Find First and Last Position',
    ],
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1) iterative, O(log n) recursive',
  },
  {
    pattern: 'Heap / Priority Queue',
    patternId: 'heap',
    description: 'Use a min-heap or max-heap to efficiently access the smallest or largest element, and to maintain the top-K elements.',
    intuition: 'A heap gives you the min (or max) in O(1) and insert/remove in O(log n). For top-K largest: maintain a min-heap of size K — if a new element is larger than the heap top, replace it.',
    pseudocode: `import heapq
heap = []
for num in nums:
    heapq.heappush(heap, num)
    if len(heap) > k:
        heapq.heappop(heap)  # remove smallest
# heap now contains K largest elements`,
    whenToUse: [
      'Kth largest/smallest element',
      'Top K frequent elements',
      'Merge K sorted arrays/lists',
      'Find median in a data stream (two heaps)',
      'Scheduling problems (task scheduler)',
    ],
    commonMistakes: [
      'Python heapq is min-heap — negate values for max-heap',
      'Confusing heap size with K (heap of size K gives Kth largest)',
      'Using sort when you only need top-K (O(n log n) vs O(n log k))',
    ],
    exampleProblems: [
      'Kth Largest Element', 'Top K Frequent Elements',
      'Merge K Sorted Arrays', 'Find Median from Data Stream',
    ],
    timeComplexity: 'O(n log k) for top-K problems',
    spaceComplexity: 'O(k)',
  },
  {
    pattern: 'Recursion and Backtracking',
    patternId: 'recursion-backtracking',
    description: 'Explore all possibilities by making choices, recursing into them, and undoing choices (backtracking) when they lead to dead ends.',
    intuition: 'Build the solution incrementally. At each step, try all valid choices. After recursing, undo the choice (backtrack) to try the next one. The recursion tree explores all valid paths.',
    pseudocode: `def backtrack(current_state, choices):
    if is_complete(current_state):
        results.append(current_state.copy())
        return
    for choice in choices:
        if is_valid(choice):
            make_choice(choice)          # add to state
            backtrack(current_state, remaining_choices)
            undo_choice(choice)          # remove from state`,
    whenToUse: [
      'Generate all permutations, combinations, subsets',
      'Solve puzzles (N-Queens, Sudoku)',
      'Palindrome partitioning',
      'Letter combinations of phone number',
      '"Find all possible X" problems',
    ],
    commonMistakes: [
      'Forgetting to undo the choice (backtrack step)',
      'Not copying the current state when adding to results',
      'Missing the base case (infinite recursion)',
      'Not pruning invalid branches early (slow but correct)',
    ],
    exampleProblems: [
      'Permutations', 'Combination Sum', 'Generate Parentheses',
      'Palindrome Partitioning',
    ],
    timeComplexity: 'O(n! or 2^n) — exponential, depends on problem',
    spaceComplexity: 'O(n) recursion depth',
  },
  {
    pattern: 'Tree',
    patternId: 'tree',
    description: 'Traverse and manipulate binary trees using DFS (inorder/preorder/postorder) or BFS (level order), typically with recursion.',
    intuition: 'Most tree problems are solved by recursion. For DFS: define what the function returns, handle base case (null node), combine results from left and right subtrees. For BFS: use a queue, process level by level.',
    pseudocode: `# DFS pattern
def solve(node):
    if not node: return base_value
    left = solve(node.left)
    right = solve(node.right)
    return combine(node.val, left, right)

# BFS pattern
queue = deque([root])
while queue:
    node = queue.popleft()
    process(node)
    if node.left: queue.append(node.left)
    if node.right: queue.append(node.right)`,
    whenToUse: [
      'Any tree traversal (inorder = sorted BST)',
      'Tree height, depth, diameter',
      'Path sum problems',
      'LCA (Lowest Common Ancestor)',
      'Validate/construct BST',
    ],
    commonMistakes: [
      'Not handling null nodes in base case',
      'Modifying the tree when you should just read it',
      'Confusing BST properties (left < root < right — ALL descendants, not just children)',
    ],
    exampleProblems: [
      'Maximum Depth of Binary Tree', 'Binary Tree Level Order Traversal',
      'Lowest Common Ancestor', 'Validate BST', 'Path Sum',
    ],
    timeComplexity: 'O(n) — visit each node once',
    spaceComplexity: 'O(h) for DFS (h = height), O(n) for BFS',
  },
  {
    pattern: 'Hash Maps',
    patternId: 'hash-maps',
    description: 'Use hash maps (dicts) for O(1) lookup to count frequencies, track seen elements, or group items by a key.',
    intuition: 'Any time you need to answer "have I seen this before?" or "how many times does X appear?" in O(1), use a hash map. The key is what you\'re looking up; the value is what you want to remember.',
    pseudocode: `freq = {}
for char in s:
    freq[char] = freq.get(char, 0) + 1

# Or use Counter
from collections import Counter
freq = Counter(s)`,
    whenToUse: [
      'First non-repeating character',
      'Group anagrams (sort word as key)',
      'Two sum (complement lookup)',
      'Frequency counting problems',
      'Caching / memoization in DP',
    ],
    commonMistakes: [
      'Iterating over dict while modifying it',
      'Using list as dict key (not hashable — use tuple)',
      'Forgetting defaultdict or .get(key, 0) for missing keys',
    ],
    exampleProblems: [
      'First Unique Character', 'Ransom Note',
      'Maximum Number of Balloons', 'Two Sum',
    ],
    timeComplexity: 'O(n) average',
    spaceComplexity: 'O(n)',
  },
];

async function setupWeaviate() {
  console.log('🔌 Connecting to Weaviate at', rawUrl);

  // Test connection
  try {
    await client.misc.metaGetter().do();
    console.log('✅ Weaviate connection successful');
  } catch (err) {
    console.error('❌ Cannot connect to Weaviate. Make sure docker compose is running:');
    console.error('   docker compose up -d');
    process.exit(1);
  }

  // ── 1. Create schema ────────────────────────────────────────────────────────
  const existingClasses = await client.schema.getter().do();
  const classExists = existingClasses.classes?.some(
    (c: any) => c.class === 'PatternKnowledge'
  );

  if (classExists) {
    console.log('ℹ️  PatternKnowledge schema already exists — skipping creation');
  } else {
    await client.schema.classCreator().withClass({
      class: 'PatternKnowledge',
      description: 'DSA pattern knowledge for RAG-powered explanations',
      vectorizer: 'text2vec-transformers',
      properties: [
        { name: 'pattern',          dataType: ['text'] },
        { name: 'patternId',        dataType: ['text'] },
        { name: 'description',      dataType: ['text'] },
        { name: 'intuition',        dataType: ['text'] },
        { name: 'pseudocode',       dataType: ['text'] },
        { name: 'whenToUse',        dataType: ['text[]'] },
        { name: 'commonMistakes',   dataType: ['text[]'] },
        { name: 'exampleProblems',  dataType: ['text[]'] },
        { name: 'timeComplexity',   dataType: ['text'] },
        { name: 'spaceComplexity',  dataType: ['text'] },
      ],
    }).do();
    console.log('✅ PatternKnowledge schema created');
  }

  // ── 2. Seed pattern knowledge ───────────────────────────────────────────────
  let inserted = 0;
  let skipped = 0;

  for (const knowledge of PATTERN_KNOWLEDGE) {
    // Check if this pattern already exists
    const existing = await client.graphql.get()
      .withClassName('PatternKnowledge')
      .withWhere({
        path: ['patternId'],
        operator: 'Equal',
        valueText: knowledge.patternId,
      })
      .withFields('patternId')
      .do();

    const count = existing?.data?.Get?.PatternKnowledge?.length ?? 0;
    if (count > 0) {
      skipped++;
      continue;
    }

    await client.data.creator()
      .withClassName('PatternKnowledge')
      .withProperties(knowledge)
      .do();

    inserted++;
    process.stdout.write(`  ✓ ${knowledge.pattern}\n`);
  }

  console.log(`\n✅ Weaviate setup complete`);
  console.log(`   Inserted: ${inserted} patterns`);
  console.log(`   Skipped (already exist): ${skipped} patterns`);
}

setupWeaviate().catch(err => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
