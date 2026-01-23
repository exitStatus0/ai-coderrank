# ArgoCD Deployment Guide

This directory contains ArgoCD manifests for GitOps deployment of AI CoderRank.

## Prerequisites

1. **ArgoCD installed in your cluster**
   ```bash
   # Check if ArgoCD is installed
   kubectl get pods -n argocd
   ```

2. **Git repository** (update `repoURL` in `application.yaml`)

3. **ArgoCD CLI** (optional, for easier management)
   ```bash
   # Install ArgoCD CLI
   brew install argocd  # macOS
   # or download from https://argo-cd.readthedocs.io/en/stable/cli_installation/
   ```

## Quick Start

### 1. Update Git Repository URL

Edit `argocd/application.yaml` and set your repository URL:

```yaml
source:
  repoURL: https://github.com/YOUR_USERNAME/ai-coderrank.git
  targetRevision: main
  path: k8s
```

### 2. Deploy the Application

```bash
# Apply the ArgoCD application
kubectl apply -f argocd/application.yaml

# Or if you prefer the ArgoCD CLI:
argocd app create -f argocd/application.yaml
```

### 3. Verify Deployment

```bash
# Check application status
kubectl get applications -n argocd

# Get detailed status
argocd app get ai-coderrank

# Watch sync progress
argocd app sync ai-coderrank --watch
```

### 4. Access ArgoCD UI

```bash
# Port forward to ArgoCD server
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Open browser to https://localhost:8080
# Login: admin / <password from above>
```

## GitOps Workflow

### Manual Sync

```bash
# Sync the application
argocd app sync ai-coderrank

# Sync and wait
argocd app sync ai-coderrank --wait
```

### Auto-Sync (Optional)

To enable automatic syncing when Git changes are detected, uncomment the `automated` section in `application.yaml`:

```yaml
syncPolicy:
  automated:
    prune: true      # Delete resources removed from Git
    selfHeal: true   # Auto-sync if cluster state drifts
```

### Update Application

1. **Make changes to k8s manifests**
2. **Commit and push to Git**
3. **ArgoCD will detect changes** (manual or auto-sync based on config)

```bash
# Manual sync after Git push
argocd app sync ai-coderrank

# Or click "Sync" in ArgoCD UI
```

## Useful Commands

```bash
# View application details
argocd app get ai-coderrank

# View application logs
argocd app logs ai-coderrank

# Delete application (keeps resources)
argocd app delete ai-coderrank --cascade=false

# Delete application and all resources
argocd app delete ai-coderrank --cascade

# Refresh application (re-read Git)
argocd app refresh ai-coderrank

# Diff between Git and cluster
argocd app diff ai-coderrank
```

## Troubleshooting

### Application stuck in "Progressing"

```bash
# Check sync status
argocd app get ai-coderrank

# View events
kubectl get events -n ai-coderrank --sort-by='.lastTimestamp'
```

### Image pull issues

If using private GHCR images, create an image pull secret:

```bash
kubectl create secret docker-registry ghcr-secret \
  --namespace=ai-coderrank \
  --docker-server=ghcr.io \
  --docker-username=YOUR_GITHUB_USERNAME \
  --docker-password=YOUR_GITHUB_PAT

# Uncomment imagePullSecrets in deployment.yaml and cronjob.yaml
```

### Out of sync

```bash
# Hard refresh to resolve sync issues
argocd app sync ai-coderrank --force --prune
```

## Best Practices

1. **Use specific image tags** instead of `latest` for production
2. **Enable auto-sync** for continuous deployment
3. **Set up webhooks** in Git for instant sync triggers
4. **Use ArgoCD Projects** to organize multiple applications
5. **Enable notifications** for deployment events

## Advanced: Multiple Environments

Create separate applications for different environments:

```bash
# Production
argocd/application-prod.yaml  → k8s/overlays/prod

# Staging
argocd/application-staging.yaml → k8s/overlays/staging
```

Use Kustomize overlays to manage environment-specific configurations.
