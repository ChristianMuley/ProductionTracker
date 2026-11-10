import { useEffect, useState } from 'react';

//region API
import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  dispatchOrder
} from './api/orders';

import {
  getSession,
  logoutUser,
  type AuthSession
} from './api/auth';
//endregion

//region Components
import Header from './components/Header';
import LoginModal from './components/LoginModal';
import OrderList from './components/OrderList';
import OrderFilters from './components/OrderFilters';
import OrderForm from './components/OrderForm';
import EditOrderModal from './components/EditOrderModal';
import ProductionOverview from './components/ProductionOverview';
//endregion

//region Types
import type {
  ProductionOrder,
  CreateProductionOrder
} from './types/order';
//endregion


function App() {

  //region State
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedOrder, setSelectedOrder] =
    useState<ProductionOrder | null>(null);

  const [dispatchingId, setDispatchingId] =
    useState<number | null>(null);

  // Authentication state
  // null means we're still checking the current session
  const [session, setSession] =
    useState<AuthSession | null>(null);

  const [showLogin, setShowLogin] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  //endregion


  //region Check Authentication
  useEffect(() => {
    let active = true;

    getSession()
      .then(currentSession => {
        if (active) {
          setSession(currentSession);
        }
      })
      .catch(err => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to check authentication."
          );

          setSession({
            authenticated: false,
            username: null
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);
  //endregion


  //region Login
  function handleLoginSuccess(newSession: AuthSession) {
    setSession(newSession);
    setShowLogin(false);
    setOrders([]);
    setError(null);
    setIsLoading(true);
  }
  //endregion


  //region Logout
  async function handleLogout(): Promise<void> {
    setIsLoggingOut(true);
    setError(null);

    try {
      // End the Django session
      const newSession = await logoutUser();

      // Update authentication state
      setSession(newSession);

      // Clear data from the previous session
      setOrders([]);
      setSelectedOrder(null);
      setIsLoading(true);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to log out."
      );

    } finally {
      setIsLoggingOut(false);
    }
  }
  //endregion


  //region Retrieve Orders
  useEffect(() => {

    // Only retrieve orders when authenticated
    if (!session?.authenticated) return;

    let active = true;
    let isFetching = false;

    async function refreshOrders() {
      if (isFetching) return;

      isFetching = true;

      try {
        const data = await getOrders();

        if (active) {
          setOrders(data);
          setError(null);
        }

      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load orders."
          );
        }

      } finally {
        isFetching = false;

        if (active) {
          setIsLoading(false);
        }
      }
    }

    // Retrieve orders immediately after login
    void refreshOrders();

    // Refresh automatically every second
    const intervalId = setInterval(() => {
      void refreshOrders();
    }, 1000);

    // Stop polling after logout or unmount
    return () => {
      active = false;
      clearInterval(intervalId);
    };

  }, [session?.authenticated]);
  //endregion


  //region Create Orders
  async function handleCreateOrder(
    order: CreateProductionOrder
  ): Promise<void> {

    const createdOrder = await createOrder(order);

    setOrders(previousOrders =>
      [...previousOrders, createdOrder]
    );
  }
  //endregion


  //region Update Orders
  async function handleUpdateOrder(
    id: number,
    changes: Partial<CreateProductionOrder>
  ): Promise<void> {

    const updatedOrder = await updateOrder(id, changes);

    setOrders(previousOrders =>
      previousOrders.map(order =>
        order.id === id ? updatedOrder : order
      )
    );
  }
  //endregion


  //region Delete Orders
  async function handleDeleteOrder(id: number): Promise<void> {

    await deleteOrder(id);

    setOrders(previousOrders =>
      previousOrders.filter(order => order.id !== id)
    );
  }
  //endregion


  //region Dispatch Orders
  async function handleDispatchOrder(
    id: number,
    priority: boolean
  ): Promise<void> {

    setError(null);
    setDispatchingId(id);

    try {
      const updatedOrder = await dispatchOrder(id, priority);

      setOrders(previousOrders =>
        previousOrders.map(order =>
          order.id === id ? updatedOrder : order
        )
      );

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to dispatch order."
      );

    } finally {
      setDispatchingId(null);
    }
  }
  //endregion


  //region Filter Orders
  const filteredOrders = orders.filter(order => {

    const matchesStatus =
      statusFilter === "all" ||
      order.status === statusFilter;

    const matchesSearch = order.product_name
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase());

    return matchesStatus && matchesSearch;
  });
  //endregion


  //region UI
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-5 py-6 sm:px-8 sm:py-10">

      {/* Checking the existing session */}
      {session === null ? (
        <p>Checking authentication...</p>
      ) : (
        <>
          {/* Application header */}
          <Header
            authenticated={session.authenticated}
            username={session.username}
            onOpenLogin={() => setShowLogin(true)}
            onLogout={() => void handleLogout()}
            isLoggingOut={isLoggingOut}
          />

          {/* Authentication errors */}
          {error && (
            <p role="alert">Error: {error}</p>
          )}

          {/* Login modal */}
          {showLogin && !session.authenticated && (
            <LoginModal
              onSuccess={handleLoginSuccess}
              onClose={() => setShowLogin(false)}
            />
          )}

          {/* Authenticated dashboard */}
          {session.authenticated ? (
            <>
              {/* Create production orders */}
              <OrderForm onCreate={handleCreateOrder} />

              {/* Live production overview */}
              <ProductionOverview orders={orders} />

              {/* Search and filter orders */}
              <OrderFilters
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                onSearchChange={setSearchTerm}
                onStatusChange={setStatusFilter}
              />

              {/* Production order list */}
              {isLoading ? (
                <p>Loading orders...</p>
              ) : (
                <OrderList
                  orders={filteredOrders}
                  onEdit={setSelectedOrder}
                  onDispatch={handleDispatchOrder}
                  dispatchingId={dispatchingId}
                />
              )}

              {/* Edit and delete modal */}
              {selectedOrder && (
                <EditOrderModal
                  key={selectedOrder.id}
                  order={selectedOrder}
                  onSave={handleUpdateOrder}
                  onDelete={handleDeleteOrder}
                  onClose={() => setSelectedOrder(null)}
                />
              )}
            </>
          ) : (
            <p>
              Please log in to access the production dashboard.
            </p>
          )}
        </>
      )}

    </main>
  );
  //endregion
}

export default App;
