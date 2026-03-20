import { Link } from "react-router-dom";
import { useCategories } from "../../context";
import { Card, Spinner, EmptyState } from "../../components/ui";
import { HiOutlineFolder, HiOutlineChevronRight } from "react-icons/hi";

export default function CategoriesPage() {
  const { categories, loading } = useCategories();

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Categories</h1>
        <p className="text-text-secondary mt-1">Explore listings by category</p>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={<HiOutlineFolder className="w-12 h-12" />}
          title="No categories yet"
          description="Categories will appear here once they are created."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Card key={cat._id} className="hover:shadow-md transition-shadow">
              <Card.Body>
                <Link
                  to={`/categories/${cat.slug}`}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <HiOutlineFolder className="w-5 h-5 text-primary-600" />
                    </div>
                    <span className="font-semibold text-text-primary group-hover:text-primary-600 transition-colors">
                      {cat.name}
                    </span>
                  </div>
                  <HiOutlineChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary-600 transition-colors" />
                </Link>

                {cat.subcategories?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border space-y-1">
                    {cat.subcategories.map((sub) => (
                      <Link
                        key={sub._id}
                        to={`/listings?category=${sub._id}`}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-text-secondary hover:text-primary-600 hover:bg-primary-50 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 bg-text-muted rounded-full" />
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
