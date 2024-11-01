"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { SubmissionModal } from "@/components/SubmissionModal";
import { cn } from "@/lib/utils";

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

interface Submission {
  id: string;
  name: string;
  username: string;
  status: string;
  created_at: string;
  description: string;
  original_language: string;
  authors: string[];
  genres: string[];
  original_publisher: string;
  complete_original: boolean;
  cover_image_url?: string;
}

export default function AdminSubmissionsPage() {
  const { user } = useUser();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, [currentPage]);

  const fetchSubmissions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/admin/submissions?page=${currentPage}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch submissions");
      }
      const data = await response.json();
      setSubmissions(data.submissions);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to fetch submissions. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/submissions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      if (!response.ok) {
        throw new Error("Failed to approve submission");
      }
      toast.success("Submission approved");
      fetchSubmissions();
    } catch (error) {
      console.error("Error approving submission:", error);
      toast.error("Failed to approve submission");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const feedback = prompt("Please provide feedback for rejection:");
      if (feedback === null) return;

      const response = await fetch(`/api/admin/submissions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected", feedback }),
      });
      if (!response.ok) {
        throw new Error("Failed to reject submission");
      }
      toast.success("Submission rejected");
      fetchSubmissions();
    } catch (error) {
      console.error("Error rejecting submission:", error);
      toast.error("Failed to reject submission");
    }
  };

  const handleEdit = (submission: Submission) => {
    setSelectedSubmission(submission);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Novel Submissions</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Name</TableHead>
            <TableHead className="text-center">Submitted By</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Submitted On</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => (
            <TableRow key={submission.id}>
              <TableCell className="text-center">{submission.name}</TableCell>
              <TableCell className="text-center">
                {submission.username}
              </TableCell>
              <TableCell className="text-center">
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                    {
                      "bg-yellow-100 text-yellow-800":
                        submission.status === "pending",
                      "bg-green-100 text-green-800":
                        submission.status === "approved",
                      "bg-red-100 text-red-800":
                        submission.status === "rejected",
                    },
                  )}
                >
                  {capitalizeFirstLetter(submission.status)}
                </span>
              </TableCell>
              <TableCell className="text-center whitespace-nowrap">
                {new Date(submission.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    onClick={() => handleEdit(submission)}
                    size="sm"
                    variant="outline"
                  >
                    View
                  </Button>
                  {submission.status === "pending" && (
                    <>
                      <Button
                        onClick={() => handleApprove(submission.id)}
                        size="sm"
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(submission.id)}
                        size="sm"
                        variant="destructive"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            />
          </PaginationItem>
          {[...Array(totalPages)].map((_, index) => (
            <PaginationItem key={index}>
              <PaginationLink
                href="#"
                isActive={currentPage === index + 1}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      {selectedSubmission && (
        <SubmissionModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </div>
  );
}
