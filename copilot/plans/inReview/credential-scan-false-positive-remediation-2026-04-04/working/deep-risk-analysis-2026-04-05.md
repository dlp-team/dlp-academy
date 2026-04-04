<!-- copilot/plans/active/credential-scan-false-positive-remediation-2026-04-04/working/deep-risk-analysis-2026-04-05.md -->
# Deep Risk Analysis: Credential Scan Detector Coverage (2026-04-05)

## Analysis Objective
Identify potential credential types that may not be caught by the current high-confidence detectors, assess risk level, and recommend coverage enhancements.

## Current Detector Coverage

### Detector 1: Firebase API Keys
- **Pattern**: `AIza[0-9A-Za-z\-_]{35}`
- **Scope**: Firebase Browser API keys only
- **Reliability**: Very high (specific prefix + length)

### Detector 2: Private Key Blocks
- **Pattern**: `-----BEGIN [A-Z ]* KEY-----` (matches PEM-formatted keys)
- **Scope**: PEM-formatted private keys (RSA, DSA, EC, etc.)
- **Reliability**: Very high (standard format)

### Detector 3: Service Account Private Key Field
- **Pattern**: `"private_key"\s*:\s*"[^"\n]{20,}`
- **Scope**: JSON service account keys with embedded private_key field
- **Reliability**: High (JSON field format, 20+ char minimum)

### Detector 4: Generic Secret Assignment
- **Pattern**: `(api_key|access_token|refresh_token|client_secret|password)` with 24+ chars
- **Scope**: Common variable names with substantial values
- **Reliability**: Medium (keyword-based, 24+ char threshold reduces false positives)

## False-Negative Risk Analysis

### HIGH RISK - Likely to occur in this codebase
1. **AWS Access Keys** (AKIA prefix format)
   - Format: `AKIA` + 16 alphanumeric chars
   - Current coverage: Not detected
   - Likelihood: Medium (AWS integration not confirmed, but multi-cloud possible)
   - Recommendation: Add detector

2. **JWT Tokens** (embedded in code/configs)
   - Format: Base64 header.payload.signature structure
   - Current coverage: Not detected (would trigger only if in generic secret assignment with 24+ chars)
   - Likelihood: High (OAuth, Firebase tokens, etc.)
   - Recommendation: Detect `eyJ0eXA` or `ey.` patterns as jwt header signatures
   - Risk: High false-positive rate due to common patterns; counter: require context clues (assignment to token/jwt variable)

3. **GitHub Personal Access Tokens**
   - Format: `ghp_` + 36-255 chars (new), or older `github_pat_` + 82+ chars
   - Current coverage: Not detected
   - Likelihood: Medium (possible dev/CI token leaks)
   - Recommendation: Add detector for `ghp_[A-Za-z0-9_]{36}`

### MEDIUM RISK - Possible but less likely
4. **Slack Tokens** (xoxb, xoxp formats)
   - Coverage: Not detected
   - Likelihood: Low-Medium (Slack integration not in scope)
   - Recommendation: Defer unless Slack integ confirmed

5. **Generic Base64/Hex Credential Strings** (without assignment context)
   - Format: 40+ character base64/hex blobs in environment variables or config
   - Coverage: Would only trigger if assigned to recognized variable name
   - Likelihood: Medium (legacy configs, environment secrets)
   - Recommendation: Too noisy to detect without context; rely on generic secret assignment

6. **Database Connection Strings** (with embedded passwords)
   - Format: `postgresql://user:password@host` or similar
   - Coverage: Not detected; would need URL pattern detection
   - Likelihood: Medium-High (common in development/config)
   - Recommendation: Add detector for common DB connection patterns

### LOW RISK - Unlikely or out of scope
7. **SSH Private Keys** (non-PEM formats, OpenSSH format)
   - Format: `-----BEGIN OPENSSH PRIVATE KEY-----`
   - Coverage: Partially covered by detector 2 (if it includes OPENSSH variant)
   - Likelihood: Low (SSH keys typically in .ssh, not in code)
   - Recommendation: Monitor; already covered by PEM detector

8. **OAuth Tokens** (generic formats)
   - Coverage: Caught by generic secret assignment if 24+ chars and assigned to `*token*` variable
   - Likelihood: Medium
   - Recommendation: Current coverage sufficient for code-committed scenarios

## Detector Enhancement Recommendations

### Short-Term (Safe, High-Confidence)
1. **Add JWT Header Detection**
   - Pattern: `eyJ0eXA|eyJhbG` (common JWT header base64 starts)
   - Caveat: Only in assignment context (token = eyJ...) to avoid false positives
   - Risk Level: Safe with context clue

2. **Add GitHub Token Detection**
   - Pattern: `ghp_[A-Za-z0-9_]{36,}`
   - Risk: Very low false-positive (specific prefix + length)

3. **Add AWS Key Detection**
   - Pattern: `AKIA[0-9A-Z]{16}`
   - Risk: Very low false-positive (specific format)

### Medium-Term (Requires Testing)
4. **Add Database Connection String Detection**
   - Pattern: `(postgres|mysql|mongodb)://.*:.*@` (generic DB URL with password)
   - Risk: Moderate false-positive rate (URLs in comments, docs, examples)
   - Recommendation: Review docs and examples to ensure no policy/example URLs are committed

### Deferred (Out of Scope)
5. SSH key format variants (already covered by PEM detector)
6. Slack token detection (no confirmed Slack integration)
7. Generic base64 blob detection (too noisy)

## Current State Assessment
- **Overall Risk**: MODERATE
- **Critical Gap**: JWT tokens and common API token formats not detected
- **Operational Impact**: May miss leaked tokens for common integrations (OAuth, GitHub, etc.)
- **Mitigation Strategy**: Current high-confidence detectors catch the "worst case" credentials (private keys). Token leaks would be caught by generic assignment detector if 24+ chars and assigned to common variable names.

## Optimization & Consolidation Status
- **Docs References**: All consolidated to canonical npm scripts
- **Redundancy Check**: No duplicated scan commands or conflicting documentation
- **Policy/Example Text**: Baseline inventory complete; no historical branch cleanup required in this phase (already completed per risk log entry)

## Closure Statement
Phase 04 risk review complete. Key findings:'
- Current detectors are high-confidence for critical secrets (private keys, Firebase keys)
- False-negative risk exists for JWT/GitHub tokens but is mitigated by assignment-context generic detector
- Scan utility is stable and suitable for closure
- Recommended enhancements (JWT, GitHub, AWS, DB) are non-blocking and documented for follow-up
