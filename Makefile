image=${IMAGE_NAME} # set in env

push: image
	docker push $(image)

image:
	docker build -t $(image) .
