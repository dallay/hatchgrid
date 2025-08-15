import subscribers from "@/subscribers/infrastructure/routes.subscriber";
import tags from "@/tag/infrastructure/routes.tag";
export default [...subscribers, ...tags];
