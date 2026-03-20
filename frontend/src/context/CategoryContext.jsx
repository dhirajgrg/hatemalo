import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { categoryService } from "../services";

const CategoryContext = createContext(null);

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await categoryService.getAll();
      setCategories(data.data.categories);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(
    async (catData) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await categoryService.create(catData);
        await fetchCategories();
        return data.data.category;
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to create category";
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [fetchCategories],
  );

  const updateCategory = useCallback(
    async (id, catData) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await categoryService.update(id, catData);
        await fetchCategories();
        return data.data.category;
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to update category";
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [fetchCategories],
  );

  const deleteCategory = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        await categoryService.delete(id);
        await fetchCategories();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete category");
      } finally {
        setLoading(false);
      }
    },
    [fetchCategories],
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const clearError = useCallback(() => setError(null), []);

  // Flatten categories for select dropdowns
  const flatCategories = categories.reduce((acc, parent) => {
    acc.push({ _id: parent._id, name: parent.name, slug: parent.slug });
    if (parent.subcategories) {
      parent.subcategories.forEach((sub) => {
        acc.push({
          _id: sub._id,
          name: `${parent.name} → ${sub.name}`,
          slug: sub.slug,
          parentId: parent._id,
        });
      });
    }
    return acc;
  }, []);

  const value = {
    categories,
    flatCategories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    clearError,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const ctx = useContext(CategoryContext);
  if (!ctx)
    throw new Error("useCategories must be used within CategoryProvider");
  return ctx;
}
