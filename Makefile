run-local:
	sudo docker run -d -p 8000:8000 uzhnu-server
stop-local:
	@CONTAINERS=$$(sudo docker ps -q); \
    	if [ -n "$$CONTAINERS" ]; then \
    		sudo docker stop $$CONTAINERS; \
    	else \
    		echo "No running containers to stop."; \
    	fi
