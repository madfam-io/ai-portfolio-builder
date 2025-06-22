/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

'use client';

import { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Award,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { ImageUpload } from '@/components/ui/image-upload';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { Certification } from '@/types/portfolio';
import { cn } from '@/lib/utils';
import { usePortfolioStore } from '@/lib/store/portfolio-store';

interface CertificationsSectionProps {
  certifications: Certification[];
  onUpdate: (certifications: Certification[]) => void;
}

interface CertificationFormData {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  imageUrl?: string;
}

// eslint-disable-next-line complexity
export function CertificationsSection({
  certifications = [],
  onUpdate,
}: CertificationsSectionProps) {
  const { t } = useLanguage();
  const { currentPortfolio } = usePortfolioStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [certToDelete, setCertToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<CertificationFormData>({
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
    imageUrl: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: '',
      imageUrl: '',
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    resetForm();
  };

  const handleEdit = (cert: Certification) => {
    setEditingId(cert.id);
    setIsAdding(false);
    setFormData({
      name: cert.name,
      issuer: cert.issuer,
      issueDate: cert.issueDate,
      expiryDate: cert.expiryDate || '',
      credentialId: cert.credentialId || '',
      credentialUrl: cert.credentialUrl || '',
    });
  };

  const handleSave = () => {
    if (!formData.name || !formData.issuer || !formData.issueDate) {
      return;
    }

    const newCertification: Certification = {
      id: editingId || `cert_${Date.now()}`,
      name: formData.name,
      issuer: formData.issuer,
      issueDate: formData.issueDate,
      expiryDate: formData.expiryDate || undefined,
      credentialId: formData.credentialId || undefined,
      credentialUrl: formData.credentialUrl || undefined,
    };

    let updatedCertifications: Certification[];
    if (editingId) {
      updatedCertifications = certifications.map(cert =>
        cert.id === editingId ? newCertification : cert
      );
    } else {
      updatedCertifications = [...certifications, newCertification];
    }

    // Sort by issue date (newest first)
    updatedCertifications.sort(
      (a, b) =>
        new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
    );

    onUpdate(updatedCertifications);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setCertToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (certToDelete) {
      onUpdate(certifications.filter(cert => cert.id !== certToDelete));
      setDeleteDialogOpen(false);
      setCertToDelete(null);
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMM yyyy');
    } catch {
      return dateString;
    }
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiry > new Date() && expiry <= threeMonthsFromNow;
  };

  // Popular certification issuers for autocomplete
  const popularIssuers = [
    'Microsoft',
    'Google',
    'Amazon Web Services (AWS)',
    'Cisco',
    'CompTIA',
    'Oracle',
    'IBM',
    'Salesforce',
    'Adobe',
    'PMI',
    'Scrum Alliance',
    'Linux Foundation',
    'HashiCorp',
    'Meta',
    'Coursera',
    'Udacity',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {t.certifications || 'Certifications'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t.certificationsDescription ||
              'Professional certifications and credentials'}
          </p>
        </div>
        {!isAdding && !editingId && (
          <Button onClick={handleAdd} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t.addCertification || 'Add Certification'}
          </Button>
        )}
      </div>

      {/* Certification Form */}
      {(isAdding || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingId
                ? t.editCertification || 'Edit Certification'
                : t.addCertification || 'Add Certification'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">
                {t.certificationName || 'Certification Name'} *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={
                  t.certNamePlaceholder ||
                  'e.g. AWS Certified Solutions Architect'
                }
              />
            </div>

            <div>
              <Label htmlFor="issuer">
                {t.issuingOrganization || 'Issuing Organization'} *
              </Label>
              <Input
                id="issuer"
                value={formData.issuer}
                onChange={e =>
                  setFormData({ ...formData, issuer: e.target.value })
                }
                placeholder={t.issuerPlaceholder || 'e.g. Amazon Web Services'}
                list="issuer-suggestions"
              />
              <datalist id="issuer-suggestions">
                {popularIssuers.map((issuer, index) => (
                  <option key={index} value={issuer} />
                ))}
              </datalist>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="issueDate">
                  {t.issueDate || 'Issue Date'} *
                </Label>
                <Input
                  id="issueDate"
                  type="month"
                  value={formData.issueDate}
                  onChange={e =>
                    setFormData({ ...formData, issueDate: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="expiryDate">
                  {t.expiryDate || 'Expiry Date'}
                </Label>
                <Input
                  id="expiryDate"
                  type="month"
                  value={formData.expiryDate}
                  onChange={e =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                  min={formData.issueDate}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t.leaveEmptyIfNoExpiry ||
                    'Leave empty if certification does not expire'}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="credentialId">
                  {t.credentialId || 'Credential ID'}
                </Label>
                <Input
                  id="credentialId"
                  value={formData.credentialId}
                  onChange={e =>
                    setFormData({ ...formData, credentialId: e.target.value })
                  }
                  placeholder={
                    t.credentialIdPlaceholder || 'e.g. ABCD-1234-EFGH-5678'
                  }
                />
              </div>
              <div>
                <Label htmlFor="credentialUrl">
                  {t.credentialUrl || 'Credential URL'}
                </Label>
                <Input
                  id="credentialUrl"
                  type="url"
                  value={formData.credentialUrl}
                  onChange={e =>
                    setFormData({ ...formData, credentialUrl: e.target.value })
                  }
                  placeholder={t.credentialUrlPlaceholder || 'https://...'}
                />
              </div>
            </div>

            <div>
              <Label>{t.certificateImage || 'Certificate Image'}</Label>
              <ImageUpload
                value={formData.imageUrl}
                onChange={url =>
                  setFormData({ ...formData, imageUrl: url || '' })
                }
                type="certificate"
                portfolioId={currentPortfolio?.id || ''}
                aspectRatio="auto"
                className="mt-2"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>
                {t.cancel || 'Cancel'}
              </Button>
              <Button onClick={handleSave}>
                {editingId
                  ? t.saveChanges || 'Save Changes'
                  : t.addCertification || 'Add Certification'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certifications List */}
      <div className="space-y-4">
        {certifications.map(cert => {
          const expired = isExpired(cert.expiryDate);
          const expiringSoon = isExpiringSoon(cert.expiryDate);

          return (
            <Card
              key={cert.id}
              className={cn('group relative', expired && 'opacity-60')}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <h4 className="font-semibold flex items-center gap-2">
                          {cert.name}
                          {expired && (
                            <Badge
                              variant="secondary"
                              className="bg-red-100 text-red-800"
                            >
                              {t.expired || 'Expired'}
                            </Badge>
                          )}
                          {expiringSoon && (
                            <Badge
                              variant="secondary"
                              className="bg-yellow-100 text-yellow-800"
                            >
                              {t.expiringSoon || 'Expiring Soon'}
                            </Badge>
                          )}
                        </h4>
                        <p className="text-muted-foreground">{cert.issuer}</p>
                      </div>
                    </div>

                    <div className="ml-8 space-y-1">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {t.issued || 'Issued'}:{' '}
                            {formatDateForDisplay(cert.issueDate)}
                          </span>
                        </div>
                        {cert.expiryDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {t.expires || 'Expires'}:{' '}
                              {formatDateForDisplay(cert.expiryDate)}
                            </span>
                          </div>
                        )}
                      </div>

                      {cert.credentialId && (
                        <p className="text-sm text-muted-foreground">
                          {t.credentialId || 'Credential ID'}:{' '}
                          {cert.credentialId}
                        </p>
                      )}

                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          {t.viewCredential || 'View Credential'}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(cert)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(cert.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {certifications.length === 0 && !isAdding && (
        <Card>
          <CardContent className="text-center py-12">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {t.noCertifications || 'No certifications added yet'}
            </p>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              {t.addFirstCertification || 'Add Your First Certification'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Certification Tips */}
      {certifications.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">
              <strong>{t.tip || 'Tip'}:</strong>{' '}
              {t.certificationTip ||
                'Keep your certifications up to date. Expired certifications are shown but marked clearly. Consider renewing certifications that are expiring soon.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Certification</AlertDialogTitle>
            <AlertDialogDescription>
              {t.confirmDeleteCertification ||
                'Are you sure you want to delete this certification?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
