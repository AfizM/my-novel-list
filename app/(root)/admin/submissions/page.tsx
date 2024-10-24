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

interface Submission {
  id: string;
  name: string;
  user_id: string;
  status: string;
  created_at: string;
  description: string;
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
            <TableHead>Name</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => (
            <TableRow key={submission.id}>
              <TableCell>{submission.name}</TableCell>
              <TableCell>{submission.user_id}</TableCell>
              <TableCell>{submission.status}</TableCell>
              <TableCell>
                {new Date(submission.created_at).toLocaleString()}
              </TableCell>
              <TableCell>
                <Button onClick={() => handleEdit(submission)} className="mr-2">
                  Edit
                </Button>
                {submission.status === "pending" && (
                  <>
                    <Button
                      onClick={() => handleApprove(submission.id)}
                      className="mr-2"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(submission.id)}
                      variant="destructive"
                    >
                      Reject
                    </Button>
                  </>
                )}
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
          onUpdate={fetchSubmissions}
        />
      )}
    </div>
  );
}
