$repo = "SUBWAY-MMM"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw "GitHub CLI (gh) is required. Install it or create the repository manually on GitHub."
}

gh repo create $repo --public
