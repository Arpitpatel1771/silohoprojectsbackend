// Instant Search

// Build a minimal API that responds to a query term with a list of best possible matches. Create a source file data.csv that contains > 300k names. For testing puposes, use test_data_sample.csv provided in the respository

// Use some data structure, which allows for API to work without iterating through the whole source data. API response time must be as low as possible (say ~10ms).

// You can't use any external tool - database/cache
// Getting started

// Primarily this assignment is to test problem soving / algorithm design / programming skills. We urge the programmer to use python to Python (which also results in evaluation of python programming skills), but we are not averse to a candidate using other languages (JAVA / PHP / Ruby preferred)

// Results & Ranking

//     The API must return results only when the query term length is >= 3 characters.
//     The API needs to return a JSON which needs to be list of matches (or list of match-objects): [{"name": "foo"}, {"name": "bar"}]
//     it needs to rank search results according to below criteria (in order of priority)
//         Results that start with the query term must me given priority.
//         The shortest (in length) result is preferred.

// For Bonus Points

//     Write test cases around the result ranking criteria.
//     Associate a score/rank along with each result (and show it in the UI)

// Evaluation

// While use of (appropriate) data-structures is important, the solution will be evaluated largely based on code quality, correctness and ease of understanding (good documentation and clean, structured code goes a long way).

// Data structures are just a means to an end; how you use them to write production-level code, and how easy it is to understand is of higher importance here.