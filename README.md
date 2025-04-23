# Auth CLI for Next.js

## A CLI tool to scaffold authentication backend routes into any Next.js project with support for MySQL, PostgreSQL, and libSQL (Turso) using Drizzle ORM.

### 🚀 Features

- Adds authentication API routes (/api/auth) to your project
- Installs required dependencies and configures scripts
- Sets up environment variables in a `.auth.env` file
- Supports Drizzle ORM with MySQL, PostgreSQL, and libSQL
- Easily extendable for other ORMs in future

### 📦 Installation

You can run the CLI directly via npx:

```bash
npx auth-cli
```

### ✅ Benefits

- No Boilerplate Needed: Quickly set up backend logic without rewriting auth from scratch
- Fully Customizable: You own the code — modify anything to suit your needs
- Faster Prototyping: Start building features instead of auth plumbing
- No Vendor Lock-In: Unlike 3rd-party auth or BaaS tools, you control data and logic

### 🔍 Comparison: Custom Auth vs. Third-party Auth

| Feature                     | Custom Backend (this CLI)      | Third-Party Auth/BaaS        |
| --------------------------- | ------------------------------ | ---------------------------- |
| Code Ownership              | ✅ Full control                 | ❌ Vendor controlled          |
| Customization               | ✅ Fully customizable           | ⚠️ Limited customization      |
| Security                    | ✅ Your own policies            | ❌ Must trust external vendor |
| Pricing                     | ✅ No ongoing costs             | ❌ May include usage fees     |
| Flexibility                 | ✅ Adapt to any app requirement | ❌ Limited by service         |
| DB Knowledge                | ✅ Useful but required          | ❌ Not needed initially       |
| Data Residency & Compliance | ✅ Full control                 | ❌ Bound by provider rules    |


### ⚠️ Current Limitations

- Only works in Next.js projects
- Assumes you already have DB connection
- Only Drizzle ORM supported for now
- lib/auth.ts and DB logic assumes .env.local is being used to store the secrets
- For libSQL, only Turso connections are supported
- No frontend scaffolding — backend only for now

### 🛠️ To-Do (Planned Improvements)

- [ ] Add support for other ORMs (e.g., Prisma, Kysely)
- [ ] Add support to choose the env file you want to use (or use the one already created)
- [ ] Add support for non-Next.js frameworks (Make it compatible with all Node.Js projects)
- [ ] Rollback installed npm packages on error/exit

### 🤝 Contributing

Contributions are welcome! Here's how you can help:

- Fork the repository
- Create a new branch (git checkout -b feature/your-feature-name)
- Make your changes and commit (git commit -m 'Add some feature')
- Push to the branch (git push origin feature/your-feature-name)
- Create a Pull Request

Feel free to open issues for feature suggestions or bug reports.

### 📄 License
MIT License. See LICENSE file for more details.
