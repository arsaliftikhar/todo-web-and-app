"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Navigation from "@/components/Navigation";
import { Dialog } from "@headlessui/react";
import { useAuth } from "@/components/auth-provider";
import toast from "react-hot-toast";

export default function DashboardView() {
  const { user,loadUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [description, setDescription] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null); // to edit a transaction

  // Fetch transactions on load
  useEffect(() => {
    if (user?.transactions) {
      setTransactions(user.transactions);
    }
  }, [user]);


  const handleAddOrUpdate = async () => {
    if (!amount || isNaN(amount) || !description.trim()) return;

    const payload = {
      amount: parseFloat(amount),
      transaction_type:type,
      description,
    };

    try {
      if (editing) {
        await axios.patch(`/api/user/update-transaction/${editing._id}`, payload);
        toast.success("Transaction updated")
      } else {
        await axios.post("/api/user/create-transaction", payload);
        toast.success("Transaction added")
      }
      loadUser()
      resetForm();
    } catch (err) {
      toast.error(err.message)
      console.error(err);
    }
  };


  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/user/delete-transaction/${id}`);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
      toast.success("Transaction deleted")
    } catch (err) {
      console.error(err);
    }
  };


  const handleEdit = (transaction) => {
    setEditing(transaction);
    setAmount(transaction.amount);
    setDescription(transaction.description);
    setType(transaction.transaction_type);
    setIsOpen(true);
  };


  const resetForm = () => {
    setAmount("");
    setDescription("");
    setType("income");
    setEditing(null);
    setIsOpen(false);
  };

  return (
    <div>
      <div className="">
        <Navigation />

        <h1 className="text-3xl font-bold text-blue-300 mb-6">
          👋 Hello, {user.email}
        </h1>

        {/* Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <Widget title="Current Balance" value={user?.current_balance} color="blue" />
          <Widget title="Income" value={user?.total_income} color="green" />
          <Widget title="Expense" value={user?.total_expense} color="red" />
        </div>

        <div className="flex justify-end mb-6">
          <button
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 rounded-xl font-semibold shadow-lg hover:opacity-90"
          >
            + Add Transaction
          </button>
        </div>

        {/* Transaction List */}
        <div className="mt-4">
          <h4 className="text-lg font-semibold mb-4">Transaction History</h4>
          {transactions.length === 0 ? (
            <p className="text-gray-400">Transaction not found.</p>
          ) : (
            <ul className="space-y-4">
              {transactions.map((t) => (
                <li
                  key={t._id}
                  className="bg-[#0f172a] border border-blue-800 px-4 py-3 rounded-xl flex justify-between items-center hover:bg-[#172554]"
                >
                  <div>
                    <p className="font-medium text-sm">{t.description}</p>
                    <p className="text-xs text-gray-400 capitalize">
                      {t.transaction_type}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-semibold ${
                        t.transaction_type === "income"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {t.transaction_type === "income" ? "+" : "-"}$
                      {t.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleEdit(t)}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t._id)}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Dialog open={isOpen} onClose={resetForm} className="relative z-50">
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-lg rounded-3xl bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#0f172a] p-8 border border-blue-900 shadow-[0_0_20px_rgba(0,0,255,0.2)] space-y-6 transition-all duration-300">
            <Dialog.Title className="text-2xl font-bold text-blue-400 tracking-wide mb-2">
              {editing ? "🚀 Update Transaction" : "✨ Add New Transaction"}
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 rounded-xl bg-[#0f172a] border border-blue-800 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#0f172a] border border-blue-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                  className="w-full px-4 py-3 rounded-xl bg-[#0f172a] border border-blue-800 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <button
                onClick={resetForm}
                className="px-4 py-2 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOrUpdate}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-md hover:opacity-90 transition"
              >
                {editing ? "Update" : "Add"}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

// Widget Card
const Widget = ({ title, value, color }) => {
  const colors = {
    blue: [
      "from-blue-800",
      "to-purple-700",
      "border-blue-900",
      "text-blue-100",
      "text-blue-200",
    ],
    green: [
      "from-green-700",
      "to-green-500",
      "border-green-900",
      "text-green-100",
      "text-green-200",
    ],
    red: [
      "from-red-700",
      "to-red-500",
      "border-red-900",
      "text-red-100",
      "text-red-200",
    ],
  };
  const [from, to, border, textMain, textTitle] = colors[color];

  return (
    <div
      className={`bg-gradient-to-br ${from} ${to} border ${border} shadow-2xl p-6 rounded-2xl backdrop-blur-xl hover:scale-[1.02] transition-all`}
    >
      <h3 className={`text-sm uppercase tracking-wider ${textTitle}`}>
        {title}
      </h3>
      <p className={`text-4xl font-bold mt-2 ${textMain}`}>
        ${value?.toFixed(2) ?? "0.00"}
      </p>
    </div>
  );
};
