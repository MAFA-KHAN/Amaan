# 📤 GitHub Upload Instructions

## Prerequisites

1. **Install Git**
   - Download from: https://git-scm.com/download/win
   - Run the installer with default settings
   - Restart your terminal/command prompt after installation

2. **GitHub Account**
   - Make sure you have access to: https://github.com/MAFA-KHAN/Amaan
   - Ensure the repository exists (create it if needed)

---

## Method 1: Using Batch Script (Easiest)

1. **Double-click** `upload_to_github.bat`
2. Follow the prompts
3. Done! ✅

---

## Method 2: Using PowerShell Script

1. **Right-click** `upload_to_github.ps1`
2. Select **"Run with PowerShell"**
3. If you get an execution policy error, run this first:
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
   ```
4. Run the script again
5. Done! ✅

---

## Method 3: Manual Commands

Open **Command Prompt** or **PowerShell** in this folder and run:

```bash
# 1. Initialize Git repository
git init

# 2. Add all files
git add .

# 3. Create initial commit
git commit -m "Initial commit: AMAAN - Location Intelligence & Safety Navigation for Islamabad"

# 4. Add remote repository
git remote add origin https://github.com/MAFA-KHAN/Amaan.git

# 5. Set main branch
git branch -M main

# 6. Push to GitHub
git push -u origin main
```

---

## Troubleshooting

### Error: "git is not recognized"
**Solution**: Install Git from https://git-scm.com/download/win

### Error: "remote origin already exists"
**Solution**: Run this first:
```bash
git remote remove origin
```
Then try again.

### Error: "failed to push"
**Solution**: Make sure you have write access to the repository.
You may need to authenticate:
```bash
git config --global user.name "MAFA KHAN"
git config --global user.email "your-email@example.com"
```

### Error: "Repository not found"
**Solution**: 
1. Go to https://github.com/MAFA-KHAN
2. Click "New Repository"
3. Name it "Amaan"
4. Click "Create Repository"
5. Try uploading again

---

## After Upload

1. Visit: https://github.com/MAFA-KHAN/Amaan
2. Verify all files are uploaded
3. Check that README.md displays correctly
4. Share the link! 🎉

---

## Files Included

✅ Frontend (HTML, CSS, JS)  
✅ Backend (Python Flask, C++ DSA Engine)  
✅ Documentation (README, guides, docs)  
✅ Assets (Logo, images)  
✅ Configuration (.gitignore, LICENSE)  

---

## Need Help?

- **Git Documentation**: https://git-scm.com/doc
- **GitHub Guides**: https://guides.github.com/
- **AMAAN Documentation**: See README.md

---

**Built with ❤️ for Islamabad**
