# Troubleshooting Guide

## Common Issues and Solutions

### Server Won't Start

**Error: Port 3000 already in use**
```bash
# Kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Then restart:
npm run dev
```

**Error: Module not found**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

### Browser Errors

**Error: "Cannot find module" or "Module not found"**
- Clear Next.js cache: `rm -rf .next`
- Restart dev server: `npm run dev`

**Error: "Hydration failed"**
- This is usually a client/server mismatch
- Check browser console for specific component
- Ensure all components using browser APIs have 'use client' directive

**Error: "ReferenceError: window is not defined"**
- Component is trying to access browser APIs on server
- Add 'use client' directive at top of component file
- Or use `typeof window !== 'undefined'` checks

### Build Errors

**Error: "The `border-border` class does not exist"**
- Fixed: Removed invalid CSS class from globals.css

**Error: TypeScript errors**
```bash
npm run lint
# Fix any reported errors
```

### Runtime Errors

**Error: "Cannot read property of undefined"**
- Check that data is loaded before rendering
- Add null checks: `nodes?.length > 0 && ...`

**Error: Charts not rendering**
- Ensure Recharts is installed: `npm install recharts`
- Check browser console for specific error

### Hotjar Not Working

1. Create `.env.local` file in root directory
2. Add: `NEXT_PUBLIC_HOTJAR_ID=your_hotjar_id`
3. Restart dev server: `npm run dev`

### Still Having Issues?

1. Check Node.js version: `node --version` (should be 18+)
2. Clear all caches:
   ```bash
   rm -rf node_modules .next
   npm install
   npm run dev
   ```
3. Check browser console (F12) for specific errors
4. Check terminal for compilation errors

