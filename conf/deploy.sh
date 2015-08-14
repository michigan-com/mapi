printer(){
  printf '\n' && printf '=%.0s' {1..40} && printf '\n'
  echo $1
  printf '=%.0s' {1..40} && printf '\n'
}

APP_DIR="/srv/sites/mapi"

cd $APP_DIR

printer "Deploying mapi web app ..."

printer "Grabbing latest source ..."
git pull origin master

printer "Installing node modules ..."
npm install

printer "Running gulp tasks ..."
gulp

printer "Restarting server ..."
supervisorctl restart mapi