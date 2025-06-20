'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Calendar,
  Download,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  Plus,
  Trash,
} from 'lucide-react';

import { ProtectedRoute } from '@/components/auth/protected-route';
import BaseLayout from '@/components/layouts/BaseLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/auth-store';
import { useSubscription } from '@/lib/hooks/use-subscription';

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  date: Date;
  amount: number;
  status: 'paid' | 'open' | 'failed';
  downloadUrl?: string;
}

function BillingContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user: _user } = useAuthStore();
  const subscriptionData = useSubscription();
  const subscription = subscriptionData.limits;
  const subLoading = subscriptionData.loading;

  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [deleteMethodId, setDeleteMethodId] = useState<string | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);

  const loadBillingData = useCallback(async () => {
    try {
      // Load payment methods
      const methodsRes = await fetch('/api/v1/billing/payment-methods');
      if (methodsRes.ok) {
        const methods = await methodsRes.json();
        setPaymentMethods(methods);
      }

      // Load invoices
      const invoicesRes = await fetch('/api/v1/billing/invoices');
      if (invoicesRes.ok) {
        const invoiceData = await invoicesRes.json();
        setInvoices(invoiceData);
      }
    } catch (_error) {
      // Failed to load billing data
      toast({
        title: t.error || 'Error',
        description:
          t.failedToLoadBilling || 'Failed to load billing information',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, t]);

  useEffect(() => {
    loadBillingData();
  }, [loadBillingData]);

  const handleAddPaymentMethod = async () => {
    try {
      // Create a setup session for adding a new payment method
      const response = await fetch('/api/v1/billing/setup-payment-method', {
        method: 'POST',
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      }
    } catch (_error) {
      toast({
        title: t.error || 'Error',
        description: t.failedToAddPayment || 'Failed to add payment method',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    try {
      const response = await fetch(
        `/api/v1/billing/payment-methods/${methodId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        setPaymentMethods(methods => methods.filter(m => m.id !== methodId));
        toast({
          title: t.success || 'Success',
          description: t.paymentMethodRemoved || 'Payment method removed',
        });
      }
    } catch (_error) {
      toast({
        title: t.error || 'Error',
        description:
          t.failedToRemovePayment || 'Failed to remove payment method',
        variant: 'destructive',
      });
    } finally {
      setDeleteMethodId(null);
    }
  };

  const handleSetDefaultPaymentMethod = async (methodId: string) => {
    try {
      const response = await fetch(
        `/api/v1/billing/payment-methods/${methodId}/default`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        setPaymentMethods(methods =>
          methods.map(m => ({ ...m, isDefault: m.id === methodId }))
        );
        toast({
          title: t.success || 'Success',
          description:
            t.defaultPaymentUpdated || 'Default payment method updated',
        });
      }
    } catch (_error) {
      toast({
        title: t.error || 'Error',
        description:
          t.failedToUpdatePayment || 'Failed to update payment method',
        variant: 'destructive',
      });
    }
  };

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    try {
      const response = await fetch('/api/v1/billing/cancel-subscription', {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: t.subscriptionCanceled || 'Subscription Canceled',
          description:
            t.accessUntilEnd ||
            'You will have access until the end of your billing period',
        });
        // Refresh the page to update subscription status
        window.location.reload();
      }
    } catch (_error) {
      toast({
        title: t.error || 'Error',
        description: t.failedToCancel || 'Failed to cancel subscription',
        variant: 'destructive',
      });
    } finally {
      setIsCanceling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      const response = await fetch('/api/v1/billing/reactivate-subscription', {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: t.subscriptionReactivated || 'Subscription Reactivated',
          description: t.thankYouForStaying || 'Thank you for staying with us!',
        });
        window.location.reload();
      }
    } catch (_error) {
      toast({
        title: t.error || 'Error',
        description:
          t.failedToReactivate || 'Failed to reactivate subscription',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-600">
            {t.active || 'Active'}
          </Badge>
        );
      case 'canceled':
        return <Badge variant="secondary">{t.canceled || 'Canceled'}</Badge>;
      case 'past_due':
        return <Badge variant="destructive">{t.pastDue || 'Past Due'}</Badge>;
      case 'trialing':
        return <Badge variant="outline">{t.trial || 'Trial'}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading || subLoading) {
    return (
      <BaseLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {t.billingSettings || 'Billing & Subscription'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t.manageBilling || 'Manage your subscription and payment methods'}
          </p>
        </div>

        {/* Current Plan */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t.currentPlan || 'Current Plan'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-semibold capitalize">
                    {subscription?.subscription_tier || 'Free'}
                  </h3>
                  {subscription?.subscription_status &&
                    getStatusBadge(subscription?.subscription_status)}
                </div>
                {false && (
                  <p className="text-sm text-muted-foreground">
                    {subscription?.subscription_status === 'canceled'
                      ? `${t.accessUntil || 'Access until'}: ${formatDate(new Date())}`
                      : `${t.renewsOn || 'Renews on'}: ${formatDate(new Date())}`}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {subscription?.subscription_tier !== 'free' &&
                subscription?.subscription_status === 'active' ? (
                  <Button
                    variant="outline"
                    onClick={() => router.push('/pricing')}
                  >
                    {t.changePlan || 'Change Plan'}
                  </Button>
                ) : (
                  <Button onClick={() => router.push('/pricing')}>
                    {t.upgradePlan || 'Upgrade Plan'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="payment-methods" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="payment-methods">
              <CreditCard className="w-4 h-4 mr-2" />
              {t.paymentMethods || 'Payment Methods'}
            </TabsTrigger>
            <TabsTrigger value="invoices">
              <Calendar className="w-4 h-4 mr-2" />
              {t.invoices || 'Invoices'}
            </TabsTrigger>
            <TabsTrigger value="subscription">
              <AlertCircle className="w-4 h-4 mr-2" />
              {t.subscription || 'Subscription'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payment-methods" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t.paymentMethods || 'Payment Methods'}</CardTitle>
                  <CardDescription>
                    {t.managePaymentMethods || 'Add or remove payment methods'}
                  </CardDescription>
                </div>
                <Button onClick={handleAddPaymentMethod} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  {t.addNew || 'Add New'}
                </Button>
              </CardHeader>
              <CardContent>
                {paymentMethods.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {t.noPaymentMethods || 'No payment methods added'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paymentMethods.map(method => (
                      <div
                        key={method.id}
                        className={cn(
                          'flex items-center justify-between p-4 rounded-lg border',
                          method.isDefault && 'border-primary bg-primary/5'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <CreditCard className="w-8 h-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {method.brand} •••• {method.last4}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {t.expires || 'Expires'} {method.expMonth}/
                              {method.expYear}
                            </p>
                          </div>
                          {method.isDefault && (
                            <Badge variant="secondary">
                              {t.default || 'Default'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!method.isDefault && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleSetDefaultPaymentMethod(method.id)
                              }
                            >
                              {t.setAsDefault || 'Set as Default'}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteMethodId(method.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t.billingHistory || 'Billing History'}</CardTitle>
                <CardDescription>
                  {t.downloadInvoices || 'View and download your invoices'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {t.noInvoices || 'No invoices yet'}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.date || 'Date'}</TableHead>
                        <TableHead>{t.amount || 'Amount'}</TableHead>
                        <TableHead>{t.status || 'Status'}</TableHead>
                        <TableHead className="text-right">
                          {t.invoice || 'Invoice'}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map(invoice => (
                        <TableRow key={invoice.id}>
                          <TableCell>{formatDate(invoice.date)}</TableCell>
                          <TableCell>
                            {formatCurrency(invoice.amount)}
                          </TableCell>
                          <TableCell>
                            {invoice.status === 'paid' ? (
                              <Badge variant="default" className="bg-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {t.paid || 'Paid'}
                              </Badge>
                            ) : invoice.status === 'failed' ? (
                              <Badge variant="destructive">
                                <XCircle className="w-3 h-3 mr-1" />
                                {t.failed || 'Failed'}
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                {t.pending || 'Pending'}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {invoice.downloadUrl && (
                              <Button variant="ghost" size="sm" asChild>
                                <a
                                  href={invoice.downloadUrl}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  {t.download || 'Download'}
                                </a>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t.subscriptionManagement || 'Subscription Management'}
                </CardTitle>
                <CardDescription>
                  {t.manageSubscription ||
                    'Cancel or reactivate your subscription'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscription?.subscription_status === 'active' ? (
                  <>
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                      <h4 className="font-medium mb-2">
                        {t.cancelSubscription || 'Cancel Subscription'}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        {t.cancelWarning ||
                          'You will continue to have access to your subscription until the end of the current billing period.'}
                      </p>
                      <Button
                        variant="destructive"
                        onClick={handleCancelSubscription}
                        disabled={isCanceling}
                      >
                        {isCanceling && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        {t.cancelSubscription || 'Cancel Subscription'}
                      </Button>
                    </div>
                  </>
                ) : subscription?.subscription_status === 'canceled' ? (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <h4 className="font-medium mb-2">
                      {t.reactivateSubscription || 'Reactivate Subscription'}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t.reactivateInfo ||
                        'Resume your subscription and continue enjoying premium features.'}
                    </p>
                    <Button onClick={handleReactivateSubscription}>
                      {t.reactivate || 'Reactivate'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      {t.noActiveSubscription || 'No active subscription'}
                    </p>
                    <Button
                      onClick={() => router.push('/pricing')}
                      className="mt-4"
                    >
                      {t.viewPlans || 'View Plans'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Payment Method Dialog */}
        <AlertDialog
          open={deleteMethodId !== null}
          onOpenChange={open => !open && setDeleteMethodId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t.removePaymentMethod || 'Remove Payment Method'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t.removePaymentWarning ||
                  'Are you sure you want to remove this payment method? This action cannot be undone.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.cancel || 'Cancel'}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  deleteMethodId && handleDeletePaymentMethod(deleteMethodId)
                }
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t.remove || 'Remove'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </BaseLayout>
  );
}

export default function BillingSettings() {
  return (
    <ProtectedRoute>
      <BillingContent />
    </ProtectedRoute>
  );
}
