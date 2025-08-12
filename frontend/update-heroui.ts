/**
Update all the @heroui package to the latest beta
doing the same as npm i --save @heroui/package@beta
*/
import { execSync } from "node:child_process";

import {
  extractPerVendorDependencies,
  type PackageJson,
} from "./vite.config.js";
import _packageJson from "./package.json" with { type: "json" };
const packageJson = _packageJson as PackageJson;

const heroUIPackages = extractPerVendorDependencies(packageJson, "@heroui");

//add @beta tag to  each package
const heroUIPackagesBeta = heroUIPackages.map((_package) => `${_package}@beta`);

// eslint-disable-next-line no-undef, no-console
console.log(`Updating @heroui packages: ${heroUIPackagesBeta.join(", ")}`);
execSync(`npm i --save ${heroUIPackagesBeta.join(" ")}`);
