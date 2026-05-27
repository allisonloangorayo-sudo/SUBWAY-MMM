$repo = "SUBWAY-MMM"
$owner = "allisonloangorayo-sudo"
$branch = "gh-pages"
$remoteUrl = "https://github.com/$owner/$repo.git"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw "GitHub CLI (gh) is required. Install it or create the repository manually on GitHub."
}

if (-not (Test-Path -LiteralPath ".git")) {
    git init -b $branch
}

if ((git branch --show-current) -ne $branch) {
    git checkout -B $branch
}

git add .
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
    git commit -m "Initial commit - Subway MMM dashboard"
}

gh repo view "$owner/$repo" *> $null
if ($LASTEXITCODE -ne 0) {
    gh repo create "$owner/$repo" --public --source . --remote origin
}

if (git remote get-url origin *> $null) {
    git remote set-url origin $remoteUrl
} else {
    git remote add origin $remoteUrl
}

git push -u origin $branch
