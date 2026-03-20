import { createContext, useContext, useState, useCallback } from "react";
import { listingService } from "../services";

const ListingContext = createContext(null);

export function ListingProvider({ children }) {
  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [currentListing, setCurrentListing] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchListings = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await listingService.getAll(params);
      setListings(data.data.listings);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch listings");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchListing = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await listingService.getById(id);
      setCurrentListing(data.data.listing);
      return data.data.listing;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch listing");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await listingService.getMine();
      setMyListings(data.data.listings);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch your listings");
    } finally {
      setLoading(false);
    }
  }, []);

  const createListing = useCallback(async (listingData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await listingService.create(listingData);
      setMyListings((prev) => [data.data.listing, ...prev]);
      return data.data.listing;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create listing";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateListing = useCallback(async (id, listingData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await listingService.update(id, listingData);
      setMyListings((prev) =>
        prev.map((l) => (l._id === id ? data.data.listing : l)),
      );
      return data.data.listing;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update listing";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteListing = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await listingService.delete(id);
      setMyListings((prev) => prev.filter((l) => l._id !== id));
      setListings((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete listing");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = {
    listings,
    myListings,
    currentListing,
    pagination,
    loading,
    error,
    fetchListings,
    fetchListing,
    fetchMyListings,
    createListing,
    updateListing,
    deleteListing,
    clearError,
  };

  return (
    <ListingContext.Provider value={value}>{children}</ListingContext.Provider>
  );
}

export function useListings() {
  const ctx = useContext(ListingContext);
  if (!ctx) throw new Error("useListings must be used within ListingProvider");
  return ctx;
}
