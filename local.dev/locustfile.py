import time
import json
from locust import HttpUser, TaskSet, task

class UserBehaviour(TaskSet):
    def on_start(self):
        self.post_score()

    @task(1)
    def post_score(self):
        self.client.post("/api/score", {'username': 'Sk8terBoi69', 'score': 1234})


class User(HttpUser):
    tasks = [UserBehaviour]
    host = 'https://localhost:3000'
