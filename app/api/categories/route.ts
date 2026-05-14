import {
    createCategoryController,
    getCategoriesController,
} from "@/modules/categories/controllers/category.controller";

export async function POST(
    req: Request
) {
    return createCategoryController(req);
}

export async function GET(
    req: Request
) {
    return getCategoriesController(req);
}