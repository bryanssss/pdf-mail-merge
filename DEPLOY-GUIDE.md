# Beginner Guide: Publish PDF Mail Merge Free with GitHub Pages

This project is ready for free hosting on GitHub Pages.

## What you need

- A GitHub account
- Your existing public repository named `pdf-mail-merge`
- GitHub Desktop installed on Windows
- The extracted project folder

## Part 1: Install GitHub Desktop

1. Open `https://desktop.github.com/` in your browser.
2. Download GitHub Desktop for Windows.
3. Install it.
4. Sign in using the same GitHub account that owns the `pdf-mail-merge` repository.

## Part 2: Clone your empty repository

1. Open GitHub Desktop.
2. Click **File**.
3. Click **Clone repository**.
4. Choose the **GitHub.com** tab.
5. Select `pdf-mail-merge`.
6. Under **Local path**, choose an easy place such as:
   `C:\Users\YOUR-NAME\Documents\GitHub\pdf-mail-merge`
7. Click **Clone**.

GitHub Desktop creates a folder on your computer connected to your online repository.

## Part 3: Copy the software files

1. Extract the prepared ZIP file.
2. Open the extracted folder.
3. Press `Ctrl + A` to select everything.
4. Press `Ctrl + C` to copy.
5. In GitHub Desktop, click **Repository → Show in Explorer**.
6. Paste the files inside that folder with `Ctrl + V`.
7. Do not put the whole extracted folder inside the repository folder. Copy the files that are inside it.

Correct:

```text
pdf-mail-merge
├── .github
├── src
├── package.json
├── README.md
└── index.html
```

Wrong:

```text
pdf-mail-merge
└── pdf-mail-merge-software
    ├── src
    └── package.json
```

## Part 4: Upload the code to GitHub

1. Return to GitHub Desktop.
2. You should see a list of changed files on the left.
3. In the **Summary** box, type:
   `Add PDF Mail Merge application`
4. Click **Commit to main**.
5. Click **Push origin** at the top.

Your files are now in GitHub.

## Part 5: Turn on GitHub Pages

1. Open your repository on GitHub.com.
2. Click **Settings**.
3. In the left menu, click **Pages**.
4. Under **Build and deployment**, find **Source**.
5. Select **GitHub Actions**.
6. Click the **Actions** tab near the top of the repository.
7. Open the newest workflow named **Deploy to GitHub Pages**.
8. A green tick means deployment succeeded.

Your free website address will normally be:

```text
https://YOUR-GITHUB-USERNAME.github.io/pdf-mail-merge/
```

## Part 6: Test the live software

1. Open the website address.
2. Confirm the page loads.
3. Click **Support this free tool** and confirm PayPal opens.
4. Upload a small test PDF.
5. Upload a small test CSV.
6. Complete all steps and generate a PDF.

## Updating the software later

1. Edit or replace files in the cloned repository folder.
2. Open GitHub Desktop.
3. Type a short Summary explaining the change.
4. Click **Commit to main**.
5. Click **Push origin**.
6. GitHub Pages automatically rebuilds the website.

## Common problems

### The website shows a 404 page

Check **Settings → Pages** and confirm the Source is **GitHub Actions**.

### The workflow has a red X

Open **Actions**, click the failed workflow, and read the first red error. Confirm `package.json`, `package-lock.json`, and `.github/workflows/deploy.yml` were uploaded.

### GitHub Desktop shows no files

You probably copied the project into the wrong folder. Use **Repository → Show in Explorer**, then paste the project files directly there.

### The PayPal button does not open

Confirm this link is still correct:

`https://www.paypal.com/donate/?hosted_button_id=YE9H5NCNLWU38`
