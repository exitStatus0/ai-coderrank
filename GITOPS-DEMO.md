# GitOps Demo: Theme Switching

This guide demonstrates GitOps in action by changing the application theme through a ConfigMap update.

## 🎨 How It Works

The application theme is controlled by the `THEME` environment variable in the ConfigMap:
- **`dark`** - Dark cyberpunk theme (default)
- **`light`** - Light professional theme

## 🚀 GitOps Demo Workflow

### Step 1: Initial State (Dark Theme)

Your application is currently running with the dark theme:

```yaml
# k8s/configmap.yaml
data:
  THEME: "dark"
```

### Step 2: Change Theme to Light

Edit the ConfigMap:

```bash
# Option A: Edit directly
vim k8s/configmap.yaml

# Change the THEME value:
THEME: "light"
```

Or use kubectl:

```bash
kubectl edit configmap ai-coderrank-config -n ai-coderrank
# Change THEME: "dark" to THEME: "light"
```

### Step 3: Commit and Push (GitOps Way)

```bash
# Commit the change
git add k8s/configmap.yaml
git commit -m "feat: switch to light theme for demo"
git push origin main
```

### Step 4: ArgoCD Syncs Automatically

If you have auto-sync enabled in ArgoCD:
```bash
# Watch ArgoCD sync the changes
argocd app get ai-coderrank --watch
```

Or trigger manual sync:
```bash
argocd app sync ai-coderrank
```

### Step 5: Restart Pods to Apply New Theme

The ConfigMap is updated, but pods need to restart to pick up the new environment variable:

```bash
# Restart deployment
kubectl rollout restart deployment ai-coderrank -n ai-coderrank

# Watch the rollout
kubectl rollout status deployment ai-coderrank -n ai-coderrank
```

### Step 6: Verify the Change

```bash
# Check the new theme is applied
kubectl get configmap ai-coderrank-config -n ai-coderrank -o jsonpath='{.data.THEME}'

# Access the app
kubectl port-forward -n ai-coderrank svc/ai-coderrank 3000:80

# Open http://localhost:3000 - you'll see the light theme!
```

## 🎬 Full Demo Script

```bash
# 1. Show current dark theme in browser
open http://localhost:3000

# 2. Change the theme in Git
sed -i '' 's/THEME: "dark"/THEME: "light"/' k8s/configmap.yaml

# 3. Commit and push
git add k8s/configmap.yaml
git commit -m "demo: switch to light theme"
git push

# 4. Sync with ArgoCD
argocd app sync ai-coderrank

# 5. Restart pods
kubectl rollout restart deployment ai-coderrank -n ai-coderrank

# 6. Wait for rollout to complete
kubectl rollout status deployment ai-coderrank -n ai-coderrank

# 7. Refresh browser - see the light theme!
```

## 🔄 Switch Back to Dark Theme

```bash
# Edit configmap
sed -i '' 's/THEME: "light"/THEME: "dark"/' k8s/configmap.yaml

# Commit and push
git add k8s/configmap.yaml
git commit -m "demo: switch back to dark theme"
git push

# Sync and restart
argocd app sync ai-coderrank
kubectl rollout restart deployment ai-coderrank -n ai-coderrank
```

## 💡 Key GitOps Principles Demonstrated

1. **Declarative Configuration**: Theme is declared in Git (configmap.yaml)
2. **Version Control**: Every change is tracked in Git history
3. **Automated Sync**: ArgoCD detects and applies changes automatically
4. **Desired State**: Git is the single source of truth
5. **Rollback**: Easy to revert by reverting the Git commit

## 🎥 What Makes This a Great Demo

- **Visual Impact**: Immediate, dramatic visual change
- **Simple to Understand**: One environment variable controls the theme
- **Complete Workflow**: Shows the full GitOps cycle
- **Production-Ready**: Real-world configuration management pattern
- **Repeatable**: Can switch back and forth multiple times

## 🔧 Advanced: Auto-Restart on ConfigMap Change

To automatically restart pods when ConfigMap changes, you can:

### Option 1: Add ConfigMap Hash Annotation

Add this to your deployment template annotations:

```yaml
spec:
  template:
    metadata:
      annotations:
        checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . | sha256sum }}
```

### Option 2: Use Reloader

Install Reloader to auto-restart on ConfigMap changes:

```bash
# Install Reloader
kubectl apply -f https://raw.githubusercontent.com/stakater/Reloader/master/deployments/kubernetes/reloader.yaml

# Add annotation to deployment
kubectl annotate deployment ai-coderrank \
  reloader.stakater.com/auto="true" \
  -n ai-coderrank
```

## 📊 Monitoring the Change

```bash
# Watch events
kubectl get events -n ai-coderrank --sort-by='.lastTimestamp' -w

# View pod logs during rollout
kubectl logs -n ai-coderrank -l app.kubernetes.io/name=ai-coderrank -f

# Check ArgoCD UI
open https://localhost:8080/applications/ai-coderrank
```

## 🎯 Demo Talking Points

1. **Show Git as Source of Truth**: "All configuration lives in Git"
2. **Demonstrate Auto-Sync**: "ArgoCD detected the change and synced automatically"
3. **Explain Declarative Model**: "We declare what we want, not how to get there"
4. **Highlight Auditability**: "Every change is tracked with who, what, when, why"
5. **Show Rollback Capability**: "One git revert to go back to previous state"

---

**Pro Tip**: Record your screen during the demo to create a video showing the full GitOps workflow in action!
