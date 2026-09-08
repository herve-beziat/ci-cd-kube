# CI deployer service account

## Why this exists

The CI pipeline needs to update the Deployment image on the Kubernetes
cluster after each build (`kubectl set image`). Using the personal admin
kubeconfig (full access to the whole vcluster) for this would mean that a
leaked CI secret grants complete control over the cluster, not just the
ability to update this one Deployment.

Instead, the CI authenticates as a dedicated Kubernetes ServiceAccount,
scoped by RBAC to exactly what it needs: reading and updating Deployments,
in the `pocketman` namespace only. See `k8s/ci-deployer-rbac.yaml` for the
ServiceAccount, Role and RoleBinding definitions (safe to read: it contains
no secret data, only permission definitions).

## Generating the restricted kubeconfig

This step is manual and was never committed anywhere (the resulting file
must never be committed — it contains a live credential). These are the
exact commands used, kept here so the procedure can be repeated if the
token is ever lost, rotated, or the secret needs to be regenerated.

```bash
# Extract the token and CA cert from the service account's secret
# (Kubernetes stores Secret data base64-encoded; base64 -d decodes it back
# to plain text — this is not encryption, just a storage format).
TOKEN=$(kubectl get secret pocketman-deployer-token -n pocketman -o jsonpath='{.data.token}' | base64 -d)
SERVER=$(kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}')

# Build a standalone kubeconfig file, separate from the personal admin one.
kubectl config set-cluster vcluster-etudiant-02-ci \
  --server="$SERVER" \
  --certificate-authority=<(kubectl get secret pocketman-deployer-token -n pocketman -o jsonpath='{.data.ca\.crt}' | base64 -d) \
  --embed-certs=true \
  --kubeconfig=./pocketman-ci.kubeconfig

kubectl config set-credentials pocketman-deployer \
  --token="$TOKEN" \
  --kubeconfig=./pocketman-ci.kubeconfig

kubectl config set-context pocketman-deployer \
  --cluster=vcluster-etudiant-02-ci \
  --user=pocketman-deployer \
  --namespace=pocketman \
  --kubeconfig=./pocketman-ci.kubeconfig

kubectl config use-context pocketman-deployer --kubeconfig=./pocketman-ci.kubeconfig
```

## Verifying the restriction actually works

```bash
# Must succeed
kubectl --kubeconfig=./pocketman-ci.kubeconfig get deployments -n pocketman

# Must fail with Forbidden (no permission on pods)
kubectl --kubeconfig=./pocketman-ci.kubeconfig get pods -n pocketman

# Must fail with Forbidden (wrong namespace)
kubectl --kubeconfig=./pocketman-ci.kubeconfig get deployments -n kube-system
```

## Storing it

Paste the full content of `pocketman-ci.kubeconfig` into the GitHub
repository secret `POCKETMAN_KUBECONFIG` (Settings > Secrets and
variables > Actions), then delete the local file. It is never committed
to this repository.
