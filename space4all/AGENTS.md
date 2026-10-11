<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Authenticate Google Places searches with an encrypted, server-issued visitor cookie session rather than requiring an account; this keeps billable calls session-bound without blocking public browsing.
- Keep Google Places search capped at three pages, debounced and cached in the query client; this bounds each lookup and avoids repeated automatic calls.
