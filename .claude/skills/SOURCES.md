# Skill sources

Project-scoped skills in this folder are unmodified copies of upstream skill
directories. Each folder name matches the skill's YAML `name`. To update one,
re-copy the whole directory from the same path at a newer commit and update
the SHA here; do not hand-edit upstream files (put project rules in
`/CLAUDE.md` instead).

| Skill | Repository | Path | Commit | Licence |
|---|---|---|---|---|
| emil-design-eng | [emilkowalski/skills](https://github.com/emilkowalski/skills) | `skills/emil-design-eng` | `f1090bec277140d02ed202440185ad9d02ac1490` | MIT |
| animate | emilkowalski/skills | `skills/animate` | `f1090bec277140d02ed202440185ad9d02ac1490` | MIT |
| review-animations | emilkowalski/skills | `skills/review-animations` | `f1090bec277140d02ed202440185ad9d02ac1490` | MIT |
| animation-performance | emilkowalski/skills | `skills/animation-performance` | `f1090bec277140d02ed202440185ad9d02ac1490` | MIT |
| mobile-native | emilkowalski/skills | `skills/mobile-native` | `f1090bec277140d02ed202440185ad9d02ac1490` | MIT |
| gsap-core | [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | `skills/gsap-core` | `aed9cfd3277740755f6bfc1155c7aa645403b760` | MIT |
| gsap-timeline | greensock/gsap-skills | `skills/gsap-timeline` | `aed9cfd3277740755f6bfc1155c7aa645403b760` | MIT |
| gsap-scrolltrigger | greensock/gsap-skills | `skills/gsap-scrolltrigger` | `aed9cfd3277740755f6bfc1155c7aa645403b760` | MIT |
| gsap-react | greensock/gsap-skills | `skills/gsap-react` | `aed9cfd3277740755f6bfc1155c7aa645403b760` | MIT |
| gsap-performance | greensock/gsap-skills | `skills/gsap-performance` | `aed9cfd3277740755f6bfc1155c7aa645403b760` | MIT |
| gsap-utils | greensock/gsap-skills | `skills/gsap-utils` | `aed9cfd3277740755f6bfc1155c7aa645403b760` | MIT |
| gsap-plugins | greensock/gsap-skills | `skills/gsap-plugins` | `aed9cfd3277740755f6bfc1155c7aa645403b760` | MIT |
| threejs-shaders | [CloudAI-X/threejs-skills](https://github.com/CloudAI-X/threejs-skills) | `skills/threejs-shaders` | `0e181866f095b5f06d005133876e926515390d95` | MIT |
| threejs-materials | CloudAI-X/threejs-skills | `skills/threejs-materials` | `0e181866f095b5f06d005133876e926515390d95` | MIT |
| threejs-lighting | CloudAI-X/threejs-skills | `skills/threejs-lighting` | `0e181866f095b5f06d005133876e926515390d95` | MIT |
| threejs-textures | CloudAI-X/threejs-skills | `skills/threejs-textures` | `0e181866f095b5f06d005133876e926515390d95` | MIT |
| threejs-postprocessing | CloudAI-X/threejs-skills | `skills/threejs-postprocessing` | `0e181866f095b5f06d005133876e926515390d95` | MIT |
| threejs-loaders | CloudAI-X/threejs-skills | `skills/threejs-loaders` | `0e181866f095b5f06d005133876e926515390d95` | MIT |
| threejs-performance | CloudAI-X/threejs-skills | `skills/threejs-performance` | `0e181866f095b5f06d005133876e926515390d95` | MIT |
| threejs-react-three-fiber | CloudAI-X/threejs-skills | `skills/threejs-react-three-fiber` | `0e181866f095b5f06d005133876e926515390d95` | MIT |
| threejs-asset-pipeline | CloudAI-X/threejs-skills | `skills/threejs-asset-pipeline` | `0e181866f095b5f06d005133876e926515390d95` | MIT |
| frontend-design | [anthropics/skills](https://github.com/anthropics/skills) | `skills/frontend-design` | `ca45fc496a3436251f191354091d557da31c15b5` | See `LICENSE.txt` |
| webapp-testing | anthropics/skills | `skills/webapp-testing` | `ca45fc496a3436251f191354091d557da31c15b5` | See `LICENSE.txt` |

## Licence notices

The emilkowalski, greensock and CloudAI-X repositories keep their MIT licence
only at the repository root. That root `LICENSE` file is copied verbatim into
each of their skill folders here as `LICENSE`, so the notice travels with every
copy. The two anthropics/skills skills ship their own `LICENSE.txt`, copied as is.

## Notes

- `frontend-design` was already present (added in e59c269 from the same
  commit). Its `SKILL.md` was byte-identical to upstream; the missing
  `LICENSE.txt` that its frontmatter references was added.
- Some skills mention sibling skills that are not installed here (for example
  `animate-expo`, `improve-animations`, `gsap-frameworks`,
  `threejs-fundamentals`). Those are "see also" pointers, not dependencies.
- Repository-level extras that no selected skill references
  (`emilkowalski/skills` cheat sheets, `greensock/gsap-skills` examples and
  assets) were not copied.
