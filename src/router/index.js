import Vue from "vue";
import VueRouter from "vue-router";
import Dashboard from "../views/DashboardPage.vue";
import TaskPage from "../views/TaskPage.vue";
import AuthPage from "../views/AuthPage";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Dashboard",
    component: Dashboard,
    meta: {
      title: "Dashboard Page",
      layout: "main",
    },
  },
  {
    path: "/boards/:id",
    name: "task-board",
    component: TaskPage,
    meta: {
      title: "Task Page",
      layout: "main",
    },
  },
  {
    path: "/auth",
    name: "auth",
    component: AuthPage,
    meta: {
      title: "Auth Page",
      layout: "empty",
    },
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title;
  next();
});

export default router;
