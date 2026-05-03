#este arquivo tem o objetivo de criar a imagem da aplicação em node js na maquina


#isso faz com que ele use uma imagem do node
FROM node:18 

# só define um nome pra a pasta da imagem
WORKDIR /app 

# to copiando tudo no package e colocando dentro do container
COPY package*.json ./ 

# executando o comando dentro do container
RUN npm i

# copia todo o projeto para dentro do container
COPY . .

# o container vai usar essa porta
EXPOSE 3333

# quando o container executar, vai executar esse comando


CMD [ "npm", "start" ]


# agora para construir o container use isso:
    # sudo docker build -t "nome-imagem" .
    # obs substitua o "nome-imagem" para o nome da imagem, normalmente node-app. SEM AS ASPAS

# e para rodar o container:
    #sudo docker run -p 3333:3333 "nome-imagem"
    # obs subistuir o "nome-imagem" para o nome da imagem criada. SEM AS ASPAS

    # se der certo deu certo :)
# sudo nao usa no windows


    # feito pelo Jorge Luiz 



    
    
