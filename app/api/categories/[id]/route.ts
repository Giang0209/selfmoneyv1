import {
    deleteCategoryController,
} from "@/modules/categories/controllers/category.controller";



export async function DELETE(
    req: Request,
    context: any
) {
    return deleteCategoryController(
        req,
        context
    );
}