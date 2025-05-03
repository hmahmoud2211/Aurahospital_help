import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, CheckCircle2, Clock, XCircle, ChevronRight, MapPin, CreditCard } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import Header from '@/components/Header';

const DUMMY_ORDERS = [
  {
    id: 'o1',
    patientName: 'John Smith',
    patientId: 'p123',
    items: [
      {
        medicationName: 'Amoxicillin 500mg',
        quantity: 30,
        price: 0.75
      },
      {
        medicationName: 'Ibuprofen 400mg',
        quantity: 20,
        price: 0.50
      }
    ],
    status: 'pending',
    orderDate: '2024-03-20',
    totalAmount: 32.50,
    deliveryAddress: '123 Main St, Anytown, ST 12345',
    insuranceInfo: {
      provider: 'HealthFirst',
      policyNumber: 'HF123456789'
    }
  },
  {
    id: 'o2',
    patientName: 'Emma Wilson',
    patientId: 'p124',
    items: [
      {
        medicationName: 'Lisinopril 10mg',
        quantity: 90,
        price: 0.50
      }
    ],
    status: 'processing',
    orderDate: '2024-03-19',
    totalAmount: 45.00,
    insuranceInfo: {
      provider: 'MediCare',
      policyNumber: 'MC987654321'
    }
  }
];

export default function OrdersScreen() {
  const [orders, setOrders] = useState(DUMMY_ORDERS);

  const handleProcessOrder = (orderId: string) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? { ...order, status: 'processing' as const }
          : order
      )
    );
  };

  const handleCompleteOrder = (orderId: string) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? { ...order, status: 'completed' as const }
          : order
      )
    );
  };

  const handleCancelOrder = (orderId: string) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? { ...order, status: 'cancelled' as const }
          : order
      )
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} color={Colors.warning} />;
      case 'processing':
        return <Package size={16} color={Colors.info} />;
      case 'completed':
        return <CheckCircle2 size={16} color={Colors.success} />;
      case 'cancelled':
        return <XCircle size={16} color={Colors.danger} />;
      default:
        return null;
    }
  };

  const renderOrderCard = (order: typeof DUMMY_ORDERS[0]) => (
    <View key={order.id} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.patientName}>{order.patientName}</Text>
          <Text style={styles.orderDate}>Order Date: {order.orderDate}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <View style={styles.statusIcon}>{getStatusIcon(order.status)}</View>
          <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        {order.items.map((item, index) => (
          <View key={index} style={styles.orderItem}>
            <Text style={styles.medicationName}>{item.medicationName}</Text>
            <Text style={styles.quantity}>Qty: {item.quantity}</Text>
            <Text style={styles.price}>${(item.quantity * item.price).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.orderInfo}>
        {order.deliveryAddress && (
          <View style={styles.infoRow}>
            <MapPin size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{order.deliveryAddress}</Text>
          </View>
        )}
        {order.insuranceInfo && (
          <View style={styles.infoRow}>
            <CreditCard size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText}>
              {order.insuranceInfo.provider} - {order.insuranceInfo.policyNumber}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>Total Amount:</Text>
        <Text style={styles.totalAmount}>${order.totalAmount.toFixed(2)}</Text>
      </View>

      {order.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.processButton]}
            onPress={() => handleProcessOrder(order.id)}
          >
            <Package size={16} color={Colors.background} />
            <Text style={styles.actionButtonText}>Process Order</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleCancelOrder(order.id)}
          >
            <XCircle size={16} color={Colors.background} />
            <Text style={styles.actionButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {order.status === 'processing' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => handleCompleteOrder(order.id)}
          >
            <CheckCircle2 size={16} color={Colors.background} />
            <Text style={styles.actionButtonText}>Complete Order</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header title="Process Orders" />
      <ScrollView contentContainerStyle={styles.content}>
        {orders.map(renderOrderCard)}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return `${Colors.warning}30`;
    case 'processing':
      return `${Colors.info}30`;
    case 'completed':
      return `${Colors.success}30`;
    case 'cancelled':
      return `${Colors.danger}30`;
    default:
      return Colors.border;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  patientName: {
    ...Typography.h5,
    marginBottom: 4,
  },
  orderDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusIcon: {
    marginRight: 6,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  orderItems: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicationName: {
    ...Typography.body,
    flex: 2,
  },
  quantity: {
    ...Typography.body,
    color: Colors.textSecondary,
    flex: 1,
    textAlign: 'center',
  },
  price: {
    ...Typography.body,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  orderInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    marginBottom: 16,
  },
  totalLabel: {
    ...Typography.body,
    fontWeight: '500',
  },
  totalAmount: {
    ...Typography.h5,
    color: Colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  processButton: {
    backgroundColor: Colors.info,
  },
  completeButton: {
    backgroundColor: Colors.success,
  },
  cancelButton: {
    backgroundColor: Colors.danger,
  },
  actionButtonText: {
    ...Typography.body,
    color: Colors.background,
    marginLeft: 6,
    fontWeight: '600',
  },
}); 