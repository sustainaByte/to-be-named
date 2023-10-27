#!/usr/bin/env bash
function readJson {  
  UNAMESTR=`uname`
  if [[ "$UNAMESTR" == 'Linux' ]]; then
    SED_EXTENDED='-r'
  elif [[ "$UNAMESTR" == 'Darwin' ]]; then
    SED_EXTENDED='-E'
  fi; 

  VALUE=`grep -m 1 "\"${2}\"" ${1} | sed ${SED_EXTENDED} 's/^ //;s/.*: "//;s/",?//'`

  if [ ! "$VALUE" ]; then
    echo "Error: Cannot find \"${2}\" in ${1}" >&2;
    exit 1;
  else
    echo $VALUE ;
  fi; 
}

project_name=`readJson package.json name` || exit 1;
project_version=`readJson package.json version` || exit 1;

echo "Project name: $project_name"
echo "Version: $project_version"

if sudo docker build -t docker-private-hycl-releases.int.hypercloud.ro:80/$project_name:$project_version  . ; then

    # docker push docker-private-hycl-releases.int.hypercloud.ro:80/$project_name:$project_version
    # git clone http://gitlab:NUubtagL@gitlab.int.hypercloud.ro/infrastructure/ansible-roles.git
    # cd ansible-roles/microservices
    # ansible-playbook -i inventories/staging update_swarm_service.yml --extra-vars "SERVICE_NAME=teampulse_teampulse-api-service SERVICE_VERSION=$project_version DOCKER_IMAGE_NAME=$project_name"
    # rm -rf ../../ansible-roles

    current_branch=$CI_COMMIT_REF_NAME
    # current_branch="develop"
    if [ "$current_branch" == "develop" ] || [ "$current_branch" == "main" ]; then
        echo "Pushing to docker registry"
        docker push docker-private-hycl-releases.int.hypercloud.ro:80/$project_name:$project_version
        git clone http://gitlab:NUubtagL@gitlab.int.hypercloud.ro/infrastructure/ansible-roles.git
        cd ansible-roles/microservices
        echo "ana are mere" > .vault_pass.txt
        ansible-playbook -i inventories/staging update_swarm_service.yml --extra-vars "SERVICE_NAME=teampulse_teampulse-api-service SERVICE_VERSION=$project_version DOCKER_IMAGE_NAME=$project_name" --vault-password-file .vault_pass.txt
        rm -rf .vault_pass.txt
        rm -rf ../../ansible-roles
    fi
    
    echo "Successfully built and pushed docker image"
else
    exit 1
fi

