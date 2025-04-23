#!/usr/bin/env node

import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { execa } from "execa";
import chalk from "chalk";
import ora from "ora";

const spinner = ora();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const createdFiles = new Set();
let createdPaths = [];

function logFailAndExit(message) {
  console.error(chalk.red("❌ " + message));
  process.exit(1);
}

async function validateProject(projectRoot) {
  const pkgPath = path.join(projectRoot, "package.json");
  if (!(await fs.pathExists(pkgPath))) {
    logFailAndExit(
      "No package.json found. This is not a valid Node.js project."
    );
  }

  const pkg = JSON.parse(await fs.readFile(pkgPath, "utf-8"));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  if (!deps.next) {
    logFailAndExit("Missing 'next' dependency. This is not a Next.js project.");
  }

  return pkgPath;
}

async function rollbackFiles() {
  for (const file of createdFiles) {
    try {
      await fs.remove(file);
    } catch (err) {
      console.warn(`⚠️ Failed to clean up ${file}`);
    }
  }
  console.log(chalk.red("🧹 Rolled back created files."));
}

async function main() {
  const projectRoot = process.cwd();

  const pkgPath = await validateProject(projectRoot);

  const answers = await inquirer.prompt([
    {
      name: "db",
      type: "list",
      message: "Select a database",
      default: "mysql",
      choices: ["mysql", "postgresql", "libsql"],
    },
    {
      name: "orm",
      type: "list",
      message: "Select ORM",
      choices: [{ name: "Drizzle (only supported)", value: "drizzle" }],
    },
  ]);

  const { db, orm } = answers;
  const templatePath = path.join(__dirname, "templates", db);

  const filesToCopy = [
    "app/api/auth/route.ts",
    "app/api/auth/login/route.ts",
    "app/api/auth/logout/route.ts",
    "app/api/auth/register/route.ts",
    "db/index.ts",
    "db/schema.ts",
    "lib/auth.ts",
    "drizzle.config.ts",
  ];

  try {
    for (const file of filesToCopy) {
      const src = path.join(templatePath, file);
      const dest = path.join(projectRoot, file);

      if (await fs.pathExists(src)) {
        const dest = path.join(projectRoot, file);
        if (file === "lib/auth.ts" && (await fs.pathExists(dest))) {
          // Merging: track only if we added something new
          const existing = await fs.readFile(dest, "utf-8");
          const additional = await fs.readFile(src, "utf-8");
          await fs.writeFile(dest, existing + "\n" + additional);
          createdPaths.push(dest); // Track just in case
        } else {
          await fs.ensureDir(path.dirname(dest));
          await fs.copy(src, dest);
          createdPaths.push(dest);
        }
      }
    }

    const envSrc = path.join(templatePath, ".env");
    const envDest = path.join(projectRoot, ".auth.env");
    if (await fs.pathExists(envSrc)) {
      await fs.copy(envSrc, envDest);
      createdFiles.add(envDest);
      createdPaths.push(envDest);
    }

    console.log(chalk.green("✅ Files copied successfully."));

    const baseDeps = ["jsonwebtoken"];
    const baseDevDeps = ["dotenv", "@types/jsonwebtoken"];
    const ormDepsMap = {
      drizzle: {
        deps: ["drizzle-orm"],
        devDeps: ["drizzle-kit"],
      },
    };
    const dbDepsMap = {
      mysql: ["mysql2"],
      postgresql: ["pg"],
      libsql: ["@libsql/client"],
    };
    const dbDevDepsMap = {
      mysql: [],
      postgresql: ["@types/pg"],
      libsql: [],
    };

    const deps = [...baseDeps, ...dbDepsMap[db], ...ormDepsMap[orm].deps];
    const devDeps = [
      ...baseDevDeps,
      ...dbDevDepsMap[db],
      ...ormDepsMap[orm].devDeps,
    ];

    spinner.start("Installing dependencies...");
    await execa("npm", ["install", ...deps]);
    await execa("npm", ["install", "-D", ...devDeps]);
    spinner.succeed("Dependencies installed.");

    const pkg = JSON.parse(await fs.readFile(pkgPath, "utf-8"));

    pkg.scripts = {
      ...pkg.scripts,
      "db:generate": "drizzle-kit generate",
      "db:migrate": "drizzle-kit migrate",
    };

    spinner.start("Adding DB Scripts...");
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
    spinner.succeed("DB Scripts Added.");

    console.log(chalk.green("✅ Setup complete."));
    console.log(chalk.yellow("\nNext steps:"));
    console.log(
      "• Move variables from `.auth.env` to `.env.local` with correct values"
    );
    console.log("• Change DB schema in `db/schema.ts` as needed");
    console.log("• Run `npm run db:generate` and `npm run db:migrate`");
    console.log("• Test your API endpoints\n");
  } catch (err) {
    spinner.fail("Error during setup.");
    await rollbackFiles();
    console.error(chalk.red("❌ Error occurred:"), err.message);
    process.exit(1);
  }
}

async function cleanup() {
  for (const filePath of createdPaths) {
    try {
      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
      }
    } catch (err) {
      console.warn(chalk.red(`⚠️ Failed to remove ${filePath}`));
    }
  }
  createdPaths = []; // Reset
}

main().catch(handleError);

process.on("SIGINT", () => {
  console.log(chalk.yellow("\n⚠️  Script exited by user."));
  cleanup().then(() => process.exit(0));
});

async function handleError(err) {
  console.error(chalk.red("❌ Error occurred:"), err.message || err);
  await cleanup();
  process.exit(1);
}
