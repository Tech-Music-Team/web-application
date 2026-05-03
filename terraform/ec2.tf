resource "aws_instance" "server_prod" {
  ami                    = "ami-0ec10929233384c7f"
  instance_type          = "t3.medium"
  key_name               = "chave-pi"
  vpc_security_group_ids = [aws_security_group.website-sg.id]
  iam_instance_profile   = "LabInstanceProfile"

   root_block_device {
    volume_size           = 20        
    volume_type           = "gp3"     
  
  }

  user_data = <<-EOF
  #!/bin/bash
  set -e
  exec > /var/log/user-data.log 2>&1

  # Atualiza o sistema
  apt-get update -y
  apt-get upgrade -y

  # Instala o Docker
  apt-get install -y docker.io git
  systemctl start docker
  systemctl enable docker
  sleep 10

  # Instala o Docker Compose
  curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose

  # Clona o repositório
  cd /home/ubuntu
  git clone https://github.com/Tech-Music-Team/technical-repository.git
EOF
  
  tags = {
    Name        = "TechMusic_hml"
    Provisioned = "Terraform"
  }
}


resource "aws_security_group" "website-sg" {
  name   = "website-sg"
  vpc_id = "vpc-0a3fd304aa897f578"

  tags = {
    Name        = "website_sg"
    Provisioned = "Terraform"
  }
}

# permitir ssh
resource "aws_vpc_security_group_ingress_rule" "allow_ssh" {
  security_group_id = aws_security_group.website-sg.id

  cidr_ipv4   = "0.0.0.0/0"
  from_port   = 22
  ip_protocol = "tcp"
  to_port     = 22
}

#permitir http
resource "aws_vpc_security_group_ingress_rule" "allow_http" {
  security_group_id = aws_security_group.website-sg.id

  cidr_ipv4   = "0.0.0.0/0"
  from_port   = 80
  ip_protocol = "tcp"
  to_port     = 80
}
#permitir https
resource "aws_vpc_security_group_ingress_rule" "allow_https" {
  security_group_id = aws_security_group.website-sg.id

  cidr_ipv4   = "0.0.0.0/0"
  from_port   = 443
  ip_protocol = "tcp"
  to_port     = 443
}

#permitir conexao a internet
resource "aws_vpc_security_group_egress_rule" "allow_all_outbound" {
  security_group_id = aws_security_group.website-sg.id

  cidr_ipv4 = "0.0.0.0/0"

  ip_protocol = -1

}

resource "aws_vpc_security_group_ingress_rule" "allow_tcp" {
  security_group_id = aws_security_group.website-sg.id

  cidr_ipv4   = "0.0.0.0/0"
  from_port   = 3333
  ip_protocol = "tcp"
  to_port     = 3333
}

output "ip_publico" {
  value = aws_instance.server_prod.public_ip
}

resource "aws_vpc_security_group_ingress_rule" "allow_tcp_3307" {
  security_group_id = aws_security_group.website-sg.id

  cidr_ipv4   = "0.0.0.0/0"
  from_port   = 3307
  ip_protocol = "tcp"
  to_port     = 3307
}
