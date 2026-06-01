# Physics Lab Library

Interactive simulations and guided virtual labs for online college physics courses.

This repository is a production-ready prototype for a GitHub-hosted physics lab library. It includes reusable lab infrastructure and fully implements the first available lab: **Newton's Laws Virtual Lab**.

## Project Overview

The app is designed as a client-side Vite/React application that can be deployed to GitHub Pages. It gives students a lab-library entry point, a lab details page, course-level mode selection, guided experiments, embedded assessment, graphs, data tables, and a client-side lab report.

## Current Implemented Lab

**Newton's Laws Virtual Lab** includes:

- Introduction and learning objectives
- Lab 1: Newton's First Law, inertia, and zero net force
- Lab 2: Newton's Second Law, force, mass, acceleration, and friction
- Lab 3: Newton's Third Law, action-reaction forces, free-body diagrams, and momentum
- Algebra/trig-based and calculus-based modes
- Mode-specific questions, feedback, and report language
- Animated simulations, graph panels, data tables, and a final reflection

## Future Lab Library Vision

The library page already includes placeholder cards for:

- One-Dimensional Kinematics Lab
- Projectile Motion Lab
- Work and Energy Lab
- Conservation of Momentum Lab
- Rotational Motion Lab
- Static Equilibrium Lab
- Simple Harmonic Motion Lab
- Fluids Lab
- Electric Fields Lab
- DC Circuits Lab
- Magnetism Lab
- Waves and Sound Lab
- Optics Lab
- Modern Physics Lab

Only Newton's Laws is clickable in this prototype. Future labs can reuse the same course-mode selection, lab layout, progress tracker, question cards, graph panels, data tables, free-body diagrams, and report generator.

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Recharts
- Lucide React icons
- GitHub Actions
- GitHub Pages

## Local Development Setup

Install dependencies:

```bash
npm install
```

Run the local dev server:

```bash
npm run dev
```

Vite will print the local URL, usually `http://localhost:5173/physics-labs/`.

## Build Instructions

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## GitHub Pages Deployment Instructions

1. Use the GitHub repository `dmatthewrieger/physics-labs`.
2. Push this project to the repository root.
3. In GitHub, open **Settings > Pages**.
4. Set the build and deployment source to **GitHub Actions**.
5. Push to the `main` branch.
6. The workflow in `.github/workflows/deploy.yml` builds the app and deploys the `dist` folder to GitHub Pages.

The Vite `base` setting in `vite.config.ts` is:

```ts
base: "/physics-labs/"
```

This value should match the repository name, so it is already configured for `https://dmatthewrieger.github.io/physics-labs/`.

## How to Add a New Lab

1. Add lab metadata to `src/data/labs.ts`.
2. Create a new folder under `src/labs/`, for example `src/labs/projectile-motion/`.
3. Create the lab component and any lab-specific question, physics, or type files.
4. Register the component in `src/App.tsx` or move lab selection into a dedicated lab router.
5. Add mode-specific question sets for `algebra-trig` and `calculus`.
6. Reuse shared components from `src/components/` for layout, progress, questions, graphs, tables, diagrams, and reports.

## Folder Structure

```text
physics-labs/
  .github/
    workflows/
      deploy.yml
  public/
    .nojekyll
    lab-icon.svg
  src/
    App.tsx
    main.tsx
    index.css
    data/
      labs.ts
    types/
      labTypes.ts
    components/
      DataTable.tsx
      FreeBodyDiagram.tsx
      GraphPanel.tsx
      LabCard.tsx
      LabDetails.tsx
      LabLayout.tsx
      LabLibrary.tsx
      LabReport.tsx
      ModeSelector.tsx
      ProgressTracker.tsx
      QuestionCard.tsx
      SimulationCanvas.tsx
    labs/
      newtons-laws/
        FirstLawLab.tsx
        NewtonsLawsLab.tsx
        SecondLawLab.tsx
        ThirdLawLab.tsx
        newtonsPhysics.ts
        newtonsQuestions.ts
        newtonsTypes.ts
  index.html
  package.json
  postcss.config.js
  tailwind.config.js
  tsconfig.json
  vite.config.ts
```

## Known Limitations

- Short-answer feedback uses simple keyword matching rather than natural-language grading.
- Data is stored in React state only; refreshing the browser clears progress.
- The friction model is intentionally introductory and one-dimensional.
- The report is generated client-side and is not submitted to an LMS.

## Future Improvements

- Add persistence through local storage or LMS integration.
- Add export options for CSV data tables.
- Add instructor-authored rubrics and grading keys.
- Expand the registry into a full lab router.
- Implement the placeholder labs one at a time using the shared infrastructure.
