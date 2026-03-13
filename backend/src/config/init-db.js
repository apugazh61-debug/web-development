const { pool } = require('./db');
const bcrypt = require('bcryptjs');

const questions = [
  { "id": 1, "section": "Technical", "question": "Which data structure is used in Breadth First Search?", "options": ["Stack", "Queue", "Tree", "Heap"], "correctAnswer": 1 },
  { "id": 2, "section": "Technical", "question": "Time complexity of Binary Search in worst case?", "options": ["O(n)", "O(log n)", "O(n log n)", "O(1)"], "correctAnswer": 1 },
  { "id": 3, "section": "Technical", "question": "Which protocol is used to secure HTTP communication?", "options": ["FTP", "SSH", "SSL/TLS", "SMTP"], "correctAnswer": 2 },
  { "id": 4, "section": "Technical", "question": "Which normal form removes transitive dependency?", "options": ["1NF", "2NF", "3NF", "BCNF"], "correctAnswer": 2 },
  { "id": 5, "section": "Technical", "question": "Which scheduling algorithm may cause starvation?", "options": ["Round Robin", "FCFS", "Priority Scheduling", "SJF"], "correctAnswer": 2 },
  { "id": 6, "section": "Technical", "question": "Which layer of OSI model handles encryption?", "options": ["Transport", "Session", "Presentation", "Application"], "correctAnswer": 2 },
  { "id": 7, "section": "Technical", "question": "Which sorting algorithm has best case O(n)?", "options": ["Bubble Sort", "Merge Sort", "Quick Sort", "Heap Sort"], "correctAnswer": 0 },
  { "id": 8, "section": "Technical", "question": "Which language introduced automatic garbage collection first?", "options": ["C", "Java", "Python", "Lisp"], "correctAnswer": 3 },
  { "id": 9, "section": "Technical", "question": "Which C operator has highest precedence?", "options": ["*", "++", "&&", "||"], "correctAnswer": 1 },
  { "id": 10, "section": "Technical", "question": "Which of these is not a NoSQL database?", "options": ["MongoDB", "Cassandra", "Redis", "MySQL"], "correctAnswer": 3 },
  { "id": 11, "section": "Technical", "question": "Which tree guarantees O(log n) search in worst case?", "options": ["Binary Tree", "AVL Tree", "Heap", "Trie"], "correctAnswer": 1 },
  { "id": 12, "section": "Technical", "question": "What does CAP theorem stand for?", "options": ["Consistency Availability Partition tolerance", "Control Access Protocol", "Consistency Atomicity Partition", "Cache Access Performance"], "correctAnswer": 0 },
  { "id": 13, "section": "Technical", "question": "Which memory is fastest?", "options": ["RAM", "Cache", "Register", "SSD"], "correctAnswer": 2 },
  { "id": 14, "section": "Technical", "question": "Deadlock requires how many conditions?", "options": ["2", "3", "4", "5"], "correctAnswer": 2 },
  { "id": 15, "section": "Technical", "question": "Which algorithm is used in Dijkstra's algorithm internally?", "options": ["Greedy", "Dynamic Programming", "Divide and Conquer", "Backtracking"], "correctAnswer": 0 },
  { "id": 16, "section": "Technical", "question": "Which SQL command removes table structure also?", "options": ["DELETE", "DROP", "TRUNCATE", "REMOVE"], "correctAnswer": 1 },
  { "id": 17, "section": "Technical", "question": "Which protocol uses port 443?", "options": ["HTTP", "HTTPS", "FTP", "SMTP"], "correctAnswer": 1 },
  { "id": 18, "section": "Technical", "question": "Which complexity class represents NP Complete problems?", "options": ["Easily solvable", "Polynomial time solvable", "Hard problems", "Non deterministic polynomial"], "correctAnswer": 3 },
  { "id": 19, "section": "Technical", "question": "Which Python keyword creates anonymous function?", "options": ["func", "lambda", "def", "anon"], "correctAnswer": 1 },
  { "id": 20, "section": "Technical", "question": "Which structure is used in function calls?", "options": ["Queue", "Stack", "Heap", "Graph"], "correctAnswer": 1 },
  { "id": 21, "section": "Technical", "question": "Which sorting algorithm is stable?", "options": ["Quick Sort", "Heap Sort", "Merge Sort", "Selection Sort"], "correctAnswer": 2 },
  { "id": 22, "section": "Technical", "question": "Which is not a kernel type?", "options": ["Monolithic", "Microkernel", "Hybrid", "Parallel Kernel"], "correctAnswer": 3 },
  { "id": 23, "section": "Technical", "question": "Which data structure is used in compiler parsing?", "options": ["Heap", "Stack", "Graph", "Queue"], "correctAnswer": 1 },
  { "id": 24, "section": "Technical", "question": "Which traversal prints nodes in sorted order in BST?", "options": ["Preorder", "Postorder", "Inorder", "Level order"], "correctAnswer": 2 },
  { "id": 25, "section": "Technical", "question": "Which Java keyword prevents inheritance?", "options": ["final", "static", "private", "protected"], "correctAnswer": 0 },
  { "id": 26, "section": "Technical", "question": "Which Python structure ensures unique elements?", "options": ["List", "Tuple", "Set", "Dictionary"], "correctAnswer": 2 },
  { "id": 27, "section": "Technical", "question": "Which algorithm solves minimum spanning tree?", "options": ["Prim", "Kruskal", "Both", "Dijkstra"], "correctAnswer": 2 },
  { "id": 28, "section": "Technical", "question": "Which network topology has single point failure?", "options": ["Mesh", "Ring", "Bus", "Star"], "correctAnswer": 3 },
  { "id": 29, "section": "Technical", "question": "Which memory allocation happens during runtime?", "options": ["Static", "Dynamic", "Compile time", "Preprocessing"], "correctAnswer": 1 },
  { "id": 30, "section": "Technical", "question": "Which database index uses B-tree structure?", "options": ["Hash index", "Clustered index", "B-tree index", "Bitmap index"], "correctAnswer": 2 },
  { "id": 31, "section": "Technical", "question": "Which algorithm detects cycle in graph?", "options": ["BFS", "DFS", "Both", "Dijkstra"], "correctAnswer": 2 },
  { "id": 32, "section": "Technical", "question": "Which OS concept allows multiple programs in memory?", "options": ["Multitasking", "Multiprogramming", "Multithreading", "Multiprocessing"], "correctAnswer": 1 },
  { "id": 33, "section": "Technical", "question": "Which algorithm is used for string pattern matching?", "options": ["KMP", "DFS", "BFS", "Prim"], "correctAnswer": 0 },
  { "id": 34, "section": "Technical", "question": "Which SQL join returns matching rows only?", "options": ["Left Join", "Right Join", "Inner Join", "Full Join"], "correctAnswer": 2 },
  { "id": 35, "section": "Technical", "question": "Which memory management technique uses pages?", "options": ["Segmentation", "Paging", "Swapping", "Fragmentation"], "correctAnswer": 1 },
  { "id": 36, "section": "Technical", "question": "Which protocol sends email?", "options": ["SMTP", "HTTP", "FTP", "TCP"], "correctAnswer": 0 },
  { "id": 37, "section": "Technical", "question": "Which complexity is fastest growth?", "options": ["O(n)", "O(log n)", "O(n\u00b2)", "O(2\u207f)"], "correctAnswer": 3 },
  { "id": 38, "section": "Technical", "question": "Which Java concept allows same method name different parameters?", "options": ["Overriding", "Overloading", "Encapsulation", "Abstraction"], "correctAnswer": 1 },
  { "id": 39, "section": "Technical", "question": "Which Python module handles regular expressions?", "options": ["regex", "re", "pattern", "match"], "correctAnswer": 1 },
  { "id": 40, "section": "Technical", "question": "Which algorithm is used in Git version control?", "options": ["SHA-1 hashing", "AES", "RSA", "MD5"], "correctAnswer": 0 },
  { "id": 41, "section": "Technical", "question": "Which data structure is best for LRU Cache?", "options": ["Stack + Array", "HashMap + Doubly Linked List", "Queue", "Tree"], "correctAnswer": 1 },
  { "id": 42, "section": "Technical", "question": "Which algorithm is used in Google PageRank?", "options": ["BFS", "DFS", "Markov Chain", "Backtracking"], "correctAnswer": 2 },
  { "id": 43, "section": "Technical", "question": "Which language runs directly in JVM bytecode?", "options": ["C++", "Python", "Java", "Go"], "correctAnswer": 2 },
  { "id": 44, "section": "Technical", "question": "Which attack steals session cookies?", "options": ["SQL Injection", "XSS", "CSRF", "Phishing"], "correctAnswer": 1 },
  { "id": 45, "section": "Technical", "question": "Which data structure implements priority queue?", "options": ["Heap", "Stack", "Linked List", "Queue"], "correctAnswer": 0 },
  { "id": 46, "section": "Technical", "question": "Which algorithm solves shortest path with negative weights?", "options": ["Dijkstra", "Bellman Ford", "Prim", "Kruskal"], "correctAnswer": 1 },
  { "id": 47, "section": "Technical", "question": "Which database ensures ACID properties?", "options": ["MongoDB", "MySQL", "Redis", "Cassandra"], "correctAnswer": 1 },
  { "id": 48, "section": "Technical", "question": "Which HTTP status means resource not found?", "options": ["200", "301", "404", "500"], "correctAnswer": 2 },
  { "id": 49, "section": "Technical", "question": "Which structure stores key value pairs in Python?", "options": ["List", "Tuple", "Dictionary", "Set"], "correctAnswer": 2 },
  { "id": 50, "section": "Technical", "question": "Which algorithm complexity is best for sorting large datasets?", "options": ["O(n\u00b2)", "O(n log n)", "O(n\u00b3)", "O(2\u207f)"], "correctAnswer": 1 },
  { "id": 51, "section": "Technical", "question": "Which technique prevents deadlock?", "options": ["Banker's Algorithm", "Dijkstra", "Prim", "Floyd"], "correctAnswer": 0 },
  { "id": 52, "section": "Technical", "question": "Which language created first compiler?", "options": ["C", "FORTRAN", "COBOL", "Pascal"], "correctAnswer": 1 },
  { "id": 53, "section": "Technical", "question": "Which sorting algorithm uses divide and conquer?", "options": ["Merge Sort", "Bubble Sort", "Selection Sort", "Insertion Sort"], "correctAnswer": 0 },
  { "id": 54, "section": "Technical", "question": "Which Python structure is immutable?", "options": ["List", "Set", "Tuple", "Dictionary"], "correctAnswer": 2 },
  { "id": 55, "section": "Technical", "question": "Which OS scheduling algorithm is preemptive?", "options": ["FCFS", "SJF", "Round Robin", "Priority Non-Preemptive"], "correctAnswer": 2 },
  { "id": 56, "section": "Technical", "question": "Which data structure is used in Trie?", "options": ["Tree", "Graph", "Hash", "Queue"], "correctAnswer": 0 },
  { "id": 57, "section": "Technical", "question": "Which protocol resolves IP to MAC address?", "options": ["DNS", "ARP", "DHCP", "ICMP"], "correctAnswer": 1 },
  { "id": 58, "section": "Technical", "question": "Which complexity represents constant time?", "options": ["O(n)", "O(1)", "O(log n)", "O(n\u00b2)"], "correctAnswer": 1 },
  { "id": 59, "section": "Technical", "question": "Which database command removes all rows but keeps table?", "options": ["DELETE", "TRUNCATE", "DROP", "CLEAR"], "correctAnswer": 1 },
  { "id": 60, "section": "Technical", "question": "Which algorithm finds strongly connected components?", "options": ["Dijkstra", "Kosaraju", "Prim", "Floyd"], "correctAnswer": 1 }
];

const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        has_attempted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS results (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        total_score INTEGER NOT NULL,
        correct_count INTEGER DEFAULT 0,
        wrong_count INTEGER DEFAULT 0,
        section_scores JSONB,
        time_taken INTEGER,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        answer_details JSONB
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(255) PRIMARY KEY,
        value JSONB
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        section VARCHAR(255),
        question_text TEXT NOT NULL,
        options JSONB NOT NULL,
        correct_answer INTEGER NOT NULL
      )
    `);

    // Insert questions
    await client.query('DELETE FROM questions');
    for (const q of questions) {
      await client.query(
        'INSERT INTO questions (section, question_text, options, correct_answer) VALUES ($1, $2, $3, $4)',
        [q.section, q.question, JSON.stringify(q.options), q.correctAnswer]
      );
    }

    // Initialize settings
    await client.query("INSERT INTO settings (key, value) VALUES ('general', '{\"allowExam\": false}') ON CONFLICT (key) DO NOTHING");

    // Create hardcoded admin if not exists
    const adminEmail = 'apugazh61@gmail.com';
    const adminPass = await bcrypt.hash('Pugazh@red', 10);
    await client.query(`
      INSERT INTO users (full_name, email, password, is_admin)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE SET is_admin = TRUE
    `, ['Admin', adminEmail, adminPass, true]);

    await client.query('COMMIT');
    console.log('Database initialized successfully');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Error initializing database:', e);
  } finally {
    client.release();
    process.exit();
  }
};

initDb();
