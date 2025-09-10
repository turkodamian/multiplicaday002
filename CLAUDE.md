# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript + Vite application for an interactive image generation kiosk interface. The app provides a multi-step wizard where users can enter prompts, select avatars, and generate images through a ComfyUI backend integration.

## Key Commands

- `npm run dev` - Start development server with hot module replacement
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint on all files
- `npm run preview` - Preview the production build locally

## Architecture

### Core Application Structure

The app is built around a single-page state machine with four main steps:
- **Welcome**: Initial screen with start button
- **Input**: Prompt entry and avatar selection
- **Loading**: Generation progress indicator  
- **Result**: Display generated image with print option

### Key Technical Details

- **Responsive Scaling**: Uses `useStageScale` hook to scale a fixed 1080x1920 stage to fit any viewport using VisualViewport API
- **Custom Tailwind Theme**: Extends Tailwind with brand colors (`brand-bg`, `brand-ink`, `brand-purple`, `brand-purpleDark`) and custom shadows/border radius
- **Asset Structure**: Expects assets in `/assets/` with subdirectories for `screens/`, `avatars/`, and `demo/`

### Component Architecture

- **App.tsx**: Main application component containing all state management and UI logic
- **PurpleButton**: Reusable branded button component
- **Custom CSS Classes**: Defined in `index.css` for brand-specific styling (`.btn-pill`, `.avatar`, `.frame-shadow`, etc.)

### State Management

Uses React useState for:
- `step`: Navigation between screens ("welcome" | "input" | "loading" | "result")
- `prompt`: User text input
- `selectedAvatar`: Selected avatar ID
- `finalImageUrl`: Generated image URL

### Integration Points

- **ComfyUI Backend**: `sendToComfy()` function handles image generation (currently mocked)
- **Print Functionality**: Opens generated image in new window for printing
- **Asset Loading**: Static assets served from public directory

### Development Notes

- TypeScript with strict mode enabled
- ESLint configuration includes React hooks and refresh plugins
- No test framework currently configured
- Uses modern React 19 features with StrictMode