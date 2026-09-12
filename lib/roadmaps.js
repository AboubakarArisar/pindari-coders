const mdn = 'https://developer.mozilla.org/en-US/docs/Learn_web_development';
const react = 'https://react.dev/learn';
const next = 'https://nextjs.org/docs/app';
const node = 'https://nodejs.org/en/learn';
const sql = 'https://www.postgresql.org/docs/current/tutorial.html';
const git = 'https://git-scm.com/book/en/v2';

// Original, deliberately focused learning paths. Resource links lead to their publishers.
export const roadmaps = [
  {
    slug: 'frontend', title: 'frontend', label: 'Frontend development', category: 'Start here', symbol: '</>',
    summary: 'From your first HTML page to a responsive, working website.',
    prerequisite: 'No coding experience needed. Bring a browser, a code editor, and a little patience.',
    outcome: 'Build and publish a responsive assignment planner.',
    reference: 'https://roadmap.sh/frontend',
    steps: [
      { title: 'Understand the web', topics: ['Browser & server', 'URLs', 'HTTP'], description: 'Follow what happens when you open a URL. Learn which parts run in the browser and which come from a server before adding tools to the mix.', task: 'Open your browser’s Network panel, reload a website, and identify its HTML, CSS, and JavaScript requests.', resources: [{ title: 'MDN: getting started with the web', url: mdn }] },
      { title: 'Give content a structure', topics: ['Semantic HTML', 'Links', 'Accessible forms'], description: 'Use headings, landmarks, lists, links, and labeled form controls to describe your content. Start with a page that makes sense even without styling.', task: 'Create an assignment list with a heading, due dates, and a form. Reach every control using only your keyboard.', resources: [{ title: 'MDN: HTML fundamentals', url: mdn + '/Core/Structuring_content' }] },
      { title: 'Make it fit the screen', topics: ['Box model', 'Flexbox & Grid', 'Responsive CSS'], description: 'Learn how padding, borders, and available space affect layout. Use flexible sizing and media queries so the page fits small screens without losing information.', task: 'Style your assignment page for phone and desktop widths. Use the Flexbox lab to explore alignment.', resources: [{ title: 'MDN: CSS layout', url: mdn + '/Core/CSS_layout' }, { title: 'Try the PindariCoders Flexbox lab', url: '/lab/#playground' }] },
      { title: 'Add real interactions', topics: ['JavaScript', 'DOM events', 'Arrays & objects'], description: 'Work with values, functions, and collections, then connect them to the page through events. Render user input as text and validate it before acting on it.', task: 'Add and remove assignments. Reject empty titles and display a helpful message next to the field.', resources: [{ title: 'MDN: JavaScript foundations', url: mdn + '/Core/Scripting' }] },
      { title: 'Handle data and mistakes', topics: ['Fetch', 'Async / await', 'Loading & errors'], description: 'Practice asynchronous work and give users a useful state while they wait. Treat empty results, failed requests, and malformed responses as part of the interface.', task: 'Load sample assignments from a JSON file. Show separate loading, empty, success, and failure states.', resources: [{ title: 'MDN: using Fetch', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch' }] },
      { title: 'Ship something usable', topics: ['Git', 'Accessibility checks', 'Deployment'], description: 'Keep your work in version control, test the main journey, and publish it. Make sure controls work with a keyboard and text is still usable when enlarged.', task: 'Publish the assignment planner, write setup instructions, and ask a friend to create an assignment without your help.', resources: [{ title: 'Pro Git: version control fundamentals', url: git }, { title: 'MDN: publishing your website', url: mdn + '/Getting_started/Your_first_website/Publishing_your_website' }] },
    ],
  },
  {
    slug: 'backend', title: 'backend', label: 'Backend development', category: 'Build a foundation', symbol: '{ }',
    summary: 'Learn how APIs, databases, and the parts behind the screen work.',
    prerequisite: 'Be comfortable with JavaScript variables, functions, arrays, and asynchronous code.',
    outcome: 'Build a small, validated reading-list API with a database.',
    reference: 'https://roadmap.sh/backend',
    steps: [
      { title: 'Follow a request', topics: ['HTTP methods', 'Status codes', 'JSON'], description: 'Understand the request and response contract: URLs, headers, methods, and status codes. Distinguish a missing resource from invalid input and a server failure.', task: 'Write example requests and responses for listing, creating, and deleting a reading-list item.', resources: [{ title: 'MDN: HTTP overview', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview' }] },
      { title: 'Run JavaScript on the server', topics: ['Node.js', 'Modules', 'Async I/O'], description: 'Learn how a server process handles asynchronous work. Keep secrets in the server environment and release file handles, listeners, and other resources when finished.', task: 'Create a Node.js server with a health endpoint and a deliberate shutdown path.', resources: [{ title: 'Node.js: official learning guide', url: node }] },
      { title: 'Design a small API', topics: ['Routes', 'Validation', 'Error responses'], description: 'Choose clear resource names and validate the body, path, and query of every request. Return consistent errors without exposing stack traces or private data.', task: 'Implement reading-list create, read, update, and delete operations. Verify that invalid input returns a useful 4xx response.', resources: [{ title: 'Node.js: HTTP and server fundamentals', url: node }] },
      { title: 'Store data deliberately', topics: ['SQL', 'Constraints', 'Transactions'], description: 'Learn tables, keys, joins, and transactions before relying on an abstraction. Use parameterized queries, database constraints, and properly managed connections.', task: 'Persist books in PostgreSQL. Add a primary key and required-field constraints, then test a failed transaction.', resources: [{ title: 'PostgreSQL: official tutorial', url: sql }] },
      { title: 'Protect the boundaries', topics: ['Authentication', 'Authorization', 'Input limits'], description: 'Authentication establishes identity; authorization decides what that identity may do. Use a maintained authentication solution, enforce access on the server, and limit request sizes.', task: 'Document your API’s access rules. Test that an unauthorized user cannot read or change another user’s records.', resources: [{ title: 'OWASP: API security project', url: 'https://owasp.org/www-project-api-security/' }] },
      { title: 'Test and operate it', topics: ['Integration tests', 'Logs', 'Backups & deployment'], description: 'Test real database and API behavior, log actionable errors without secrets, and plan for shutdown and recovery. A deployed process also needs configuration and a way to diagnose failures.', task: 'Test valid and invalid requests, verify database cleanup, document environment variables, and deploy with a health check.', resources: [{ title: 'Node.js: test runner', url: 'https://nodejs.org/api/test.html' }, { title: 'Pro Git: record and share changes', url: git }] },
    ],
  },
  {
    slug: 'react', title: 'react', label: 'React', category: 'Pick up a skill', symbol: '↻',
    summary: 'Turn a static interface into small, understandable components.',
    prerequisite: 'HTML, CSS, and JavaScript fundamentals, including functions, arrays, objects, and modules.',
    outcome: 'Build a searchable reading list with editable items.',
    reference: 'https://roadmap.sh/react',
    steps: [
      { title: 'Think in components', topics: ['JSX', 'Components', 'Composition'], description: 'Split an interface according to its responsibilities. Keep components small enough to understand, without extracting every wrapper into a new file.', task: 'Turn a reading-list mockup into a page, book list, and book card using static data.', resources: [{ title: 'React: thinking in React', url: react + '/thinking-in-react' }] },
      { title: 'Pass data clearly', topics: ['Props', 'Lists', 'Stable keys'], description: 'Pass data down through props, render arrays with stable identifiers, and keep the render step pure. A component should describe the UI for the inputs it receives.', task: 'Render five books from an array. Give each book a stable ID and show a useful empty state when the array is empty.', resources: [{ title: 'React: describing the UI', url: react + '/describing-the-ui' }] },
      { title: 'Make the interface respond', topics: ['Events', 'State', 'Immutable updates'], description: 'State represents information that changes over time. Update it through React rather than mutating objects in place, and connect event handlers to meaningful user actions.', task: 'Add a form that creates a book and a button that toggles its read status.', resources: [{ title: 'React: adding interactivity', url: react + '/adding-interactivity' }] },
      { title: 'Keep state in the right place', topics: ['Derived values', 'Lifting state', 'Controlled inputs'], description: 'Store the minimum state needed. Compute filtered results from your data and query rather than storing a second copy that can fall out of sync.', task: 'Add search and a read/unread filter. Make the visible count follow the filtered result.', resources: [{ title: 'React: managing state', url: react + '/managing-state' }] },
      { title: 'Connect to the outside world', topics: ['Effects', 'Cleanup', 'Refs'], description: 'Use effects to synchronize with external systems, not for values you can calculate while rendering. Clean up subscriptions and cancel stale requests when a component unmounts.', task: 'Load sample books with explicit loading and error states. Ensure a stale request cannot overwrite newer results.', resources: [{ title: 'React: synchronizing with effects', url: react + '/synchronizing-with-effects' }] },
      { title: 'Finish the user journey', topics: ['Forms', 'Keyboard use', 'Testing'], description: 'Test the behavior a reader relies on: adding, editing, filtering, and recovering from an error. Use semantic HTML and keep focus understandable after updates.', task: 'Finish the reading list and test its complete keyboard journey. Then explore Next.js when you need application routing.', resources: [{ title: 'React: learn and practice', url: react }, { title: 'Continue to the Next.js path', url: '/roadmaps/nextjs/' }] },
    ],
  },
  {
    slug: 'nextjs', title: 'next.js', label: 'Next.js', category: 'Build an app', symbol: 'N↗',
    summary: 'Put React into a complete application with routes and clear boundaries.',
    prerequisite: 'React components, props, state, and effects. Complete the React path first if these are new.',
    outcome: 'Publish a small resource directory with individual detail pages.',
    reference: 'https://roadmap.sh/nextjs',
    steps: [
      { title: 'Get the app running', topics: ['App Router', 'Project structure', 'Development server'], description: 'Learn the app directory and the difference between the development server and a production build. Start with the current official installation guide.', task: 'Create a Next.js app and replace its starter page with a resource directory heading.', resources: [{ title: 'Next.js: installation', url: next + '/getting-started/installation' }] },
      { title: 'Give every page a home', topics: ['Pages', 'Layouts', 'Link navigation'], description: 'Use file-based routes for pages and shared layouts for navigation. Use framework links between routes so navigation can preserve the shared application shell.', task: 'Add a directory page and an about page with a shared header and footer.', resources: [{ title: 'Next.js: layouts and pages', url: next + '/getting-started/layouts-and-pages' }] },
      { title: 'Choose the right boundary', topics: ['Server Components', 'Client Components', 'Serializable props'], description: 'Keep content and data work on the server where appropriate. Add client boundaries for state, event handlers, or browser APIs, and keep secrets out of client code.', task: 'Render resource cards on the server and add a small client-side category selector.', resources: [{ title: 'Next.js: server and client components', url: next + '/getting-started/server-and-client-components' }] },
      { title: 'Add detail pages', topics: ['Dynamic segments', 'Static params', 'Not found'], description: 'Use a dynamic segment for each resource. For static export, enumerate all supported routes at build time and provide a useful missing-page experience.', task: 'Create a detail page for each resource and check that an unknown URL returns a 404.', resources: [{ title: 'Next.js: static exports', url: next + '/guides/static-exports' }] },
      { title: 'Make data behavior explicit', topics: ['Fetching', 'Loading', 'Failure states'], description: 'Decide when data is available and how fresh it needs to be. Static exports serve build-time pages; request-time server behavior needs a compatible runtime.', task: 'Use a local dataset for the first release. Explain in your README which changes require rebuilding and when a server would be necessary.', resources: [{ title: 'Next.js: fetching data', url: next + '/getting-started/fetching-data' }] },
      { title: 'Polish and publish', topics: ['Metadata', 'Production build', 'Deployment'], description: 'Give routes meaningful titles, verify internal links, and test the production output. Choose hosting that supports the features your application actually uses.', task: 'Publish the resource directory. Open a detail URL directly, reload it, and check navigation on a narrow screen.', resources: [{ title: 'Next.js: deployment', url: next + '/getting-started/deploying' }, { title: 'Next.js: guided course', url: 'https://nextjs.org/learn' }] },
    ],
  },
];

export function findRoadmap(slug) { return roadmaps.find(roadmap => roadmap.slug === slug); }
